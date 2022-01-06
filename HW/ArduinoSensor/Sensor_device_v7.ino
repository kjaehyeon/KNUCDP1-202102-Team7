//for socket.io
#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#include <Hash.h>

//for sensor
#include <DHT.h>
#include <Adafruit_Sensor.h>
#include <MQUnifiedsensor.h>

char ssid[]= "raspi-webgui";           // network ssid
char pass[] = "autoin1020";            // networ password
char server[] = "192.168.50.1";  // server IP address
//char server[] = "192.168.0.144";

//for DHT-22
#define DHTPIN            D5     //DATA Pin 
#define DHTTYPE           DHT22 //DHT22 라고 TYPE을 정의함

//for MQ-7
#define placa "Arduino UNO"
#define Voltage_Resolution 5
#define MQ7PIN A0 //Analog input 0 of your arduino
#define MQTYPE "MQ-7" //MQ7
#define ADC_Bit_Resolution 10 // For arduino UNO/MEGA/NANO
#define RatioMQ7CleanAir 27.5 //RS / R0 = 27.5 ppm 

//for Device 1
#define DEVICE_ID 1

//for led
#define RED D10
#define GREEN D11
#define BLUE D12

//for SW-18010
#define SWPIN D3
//for Flame sensor
#define FLAMEPIN D4

#define USE_SERIAL Serial

//센서값 저장을 위한 구조체
typedef struct {
  float humidity;
  float temperature;
  float co;
  float lpg;
  int vibration;
  int flame;
  int count;
} Sensorval;

//dht 클랙서 생성 (Data Pin, Sensor Type)
DHT dht(DHTPIN, DHTTYPE);
//MQ2 생성
MQUnifiedsensor MQ7(placa, Voltage_Resolution, ADC_Bit_Resolution, MQ7PIN, MQTYPE);

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

//센서값을 저장할 전역변수
Sensorval sensorval;

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
            //USE_SERIAL.printf("[IOc] get event: %s\n", payload);
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            hexdump(payload, length);
            break;
    }
}

void setup() {
    USE_SERIAL.begin(115200);
    
    pinMode(RED, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);
    
    digitalWrite(BLUE, LOW);
    digitalWrite(RED, HIGH);
    USE_SERIAL.setDebugOutput(true);
    
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }
    
    // disable AP
    if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
    }
    WiFiMulti.addAP(ssid, pass);
    
    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin(server, 8000, "/socket.io/?EIO=4");

    // event handler
    socketIO.onEvent(socketIOEvent);
    
    dht.begin();

    MQ7.setRegressionMethod(1); //_PPM =  a*ratio^b
    MQ7.setA(99.042); MQ7.setB(-1.518); // Configurate the ecuation values to get CO 
      /*
        Exponential regression:
        GAS     | a      | b
        H2      | 69.014  | -1.374
        LPG     | 700000000 | -7.703
        CH4     | 60000000000000 | -10.54
        CO      | 99.042 | -1.518
        Alcohol | 40000000000000000 | -12.35
      */
    float calcR0 = 0;
    MQ7.init();
    for(int i = 1; i<=10; i ++){
      MQ7.update(); // Update data, the arduino will be read the voltage on the analog pin
      calcR0 += MQ7.calibrate(RatioMQ7CleanAir);
      Serial.print(".");
    }
    MQ7.setR0(calcR0/10);
    Serial.println("  done!.");
  
    if(isinf(calcR0)) {Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); while(1);}
    if(calcR0 == 0){Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); while(1);}
    
    MQ7.serialDebug(true);

    sensorval.count = 0;
    sensorval.flame = 1;
    sensorval.vibration = 1; 
}

unsigned long messageTimestamp = 0;
//센서값을 전송할 시간 단위
const unsigned long Interval = 1000L;
void loop() {
   socketIO.loop();
   uint64_t now = millis();
        
    //와이파이 연결 끊어지면 다시 연결 시도
    if(WiFi.status() != WL_CONNECTED){
        digitalWrite(BLUE, LOW);
        digitalWrite(RED, HIGH);
        while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
      }
      String ip = WiFi.localIP().toString();
      USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());
      resetSensorVal();
    }else{
      digitalWrite(BLUE, HIGH);
      digitalWrite(RED, LOW);
      socketIO.loop();
      uint64_t now = millis();
      
      getSensorVal();
      delay(50);
      
      if(now - messageTimestamp > Interval && sensorval.count > 0) {
          messageTimestamp = now;
          
          int count = sensorval.count;
          sensorval.temperature = sensorval.temperature / count;
          sensorval.humidity = sensorval.humidity / count;
          sensorval.co = sensorval.co / count;
          sensorval.lpg = sensorval.lpg / count;
          
          // creat JSON message for Socket.IO (event)
          DynamicJsonDocument doc(1024);
          JsonArray array = doc.to<JsonArray>();
  
          // add evnet name
          // Hint: socket.on('event_name', ....
          array.add("sensor_data");
          // add payload (parameters) for the event
          JsonObject param1 = array.createNestedObject();
          param1["device_id"] = DEVICE_ID;
          param1["temperature"] = sensorval.temperature; 
          param1["humidity"] = sensorval.humidity;
          param1["co"] = sensorval.co;
          param1["lpg"] = sensorval.lpg;
          param1["flame"] = sensorval.flame;
          param1["vibration"] = sensorval.vibration;
  
          // JSON to String (serializion)
          String output;
          serializeJson(doc, output);
  
          // Send event
          socketIO.sendEVENT(output);
  
          // Print JSON for debugging
          USE_SERIAL.println(output);
  
          resetSensorVal();
      }
    }
}
void resetSensorVal(){
  //reset sensorval
    sensorval.temperature = 0;
    sensorval.humidity = 0;
    sensorval.co = 0;
    sensorval.lpg = 0;
    sensorval.flame = 1;
    sensorval.vibration = 1;
    sensorval.count = 0;
}
void getSensorVal(){
    //온도값 얻기
    sensorval.temperature += dht.readTemperature();
    //습도값 얻기
    sensorval.humidity += dht.readHumidity();
    
    //lpg값 얻기
    MQ7.update();
    MQ7.setA(700000000); MQ7.setB(-7.703); // set for LPG
    sensorval.lpg += MQ7.readSensor();
    //CO값 얻기
    MQ7.setA(99.042); MQ7.setB(-1.518); // set for CO
    sensorval.co += MQ7.readSensor();
    //진동값 얻기
    if(sensorval.vibration == 0 || digitalRead(SWPIN) == 0)
      sensorval.vibration = 0;
    else
      sensorval.vibration = 1;  
    //불꽃센서 정보 얻기
    if(sensorval.flame == 0 || digitalRead(FLAMEPIN) == 0)
      sensorval.flame = 0;
    else
      sensorval.flame = 1;
      
    sensorval.count++;
}
