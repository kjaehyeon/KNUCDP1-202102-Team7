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
#include <DHT_U.h>
#include <MQUnifiedsensor.h>

char ssid[]= "raspi-webgui";           // network ssid
char pass[] = "autoin1020";            // networ password
char server[] = "192.168.50.1";        // server IP address

//for DHT-22
#define DHTPIN            2     //DATA Pin 
#define DHTTYPE           DHT22 //DHT22 라고 TYPE을 정의함

//for MQ-2
#define Board             ("Arduino MEGA")
#define MQ2PIN            A0
#define MQTYPE            ("MQ-2")
#define Voltage_Resolution      (5)
#define ADC_Bit_Resolution      (10) // For arduino UNO/MEGA/NANO
#define RatioMQ2CleanAir        (9.83) //RS / R0 = 9.83 ppm

//for Device 1
#define DEVICE_ID 1

//for led
#define RED 8
#define GREEN 9
#define BLUE 10

//for SW-18010
#define SWPIN 3
//for Flame sensor
#define FLAMEPIN 4

#define USE_SERIAL Serial1

//센서값 저장을 위한 구조체
typedef struct {
  float humidity;
  float temperature;
  float co;
  float propane;
  int vibration;
  int flame;
  int count;
} Sensorval;

//dht 클랙서 생성 (Data Pin, Sensor Type)
DHT_Unified dht(DHTPIN, DHTTYPE);
//MQ2 생성
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ2PIN, MQTYPE);

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
            USE_SERIAL.printf("[IOc] get event: %s\n", payload);
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
    // USE_SERIAL.begin(921600);
    Serial.begin(9600);
    USE_SERIAL.begin(115200);

    pinMode(RED, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);
    
    digitalWrite(BLUE, LOW);
    digitalWrite(RED, HIGH);

    //Serial.setDebugOutput(true);
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
    sensor_t sensor;
    dht.temperature().getSensor(&sensor);
    dht.humidity().getSensor(&sensor);
  
    //MQ2 시작
    MQ2.setRegressionMethod(1); //_PPM =  a*ratio^b
    MQ2.setA(574.25); MQ2.setB(-2.222); // set for LPG
    /*
      Exponential regression:
      Gas    | a      | b
      H2     | 987.99 | -2.162
      LPG    | 574.25 | -2.222
      CO     | 36974  | -3.109
      Alcohol| 3616.1 | -2.675
      Propane| 658.71 | -2.168
    */
    MQ2.init(); 
    // MQ2 calibration start
    Serial.print("Calibrating please wait.");
    float calcR0 = 0;
    for(int i = 1; i<=10; i ++)
    {
      MQ2.update(); // Update data, the arduino will be read the voltage on the analog pin
      calcR0 += MQ2.calibrate(RatioMQ2CleanAir);
      Serial.print(".");
    }
    MQ2.setR0(calcR0/10);
    Serial.println("  done!.");
    
    if(isinf(calcR0)) {Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); while(1);}
    if(calcR0 == 0){Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); while(1);}
    
    MQ2.serialDebug(true);
    
    sensorval.count = 0;
    sensorval.flame = 1;
    sensorval.vibration = 1; 
}

unsigned long messageTimestamp = 0;
//센서값을 전송할 시간 단위
const unsigned long Interval = 700L;
void loop() {
    //와이파이 연결 끊어지면 다시 연결 시도
    if(WiFi.status() != WL_CONNECTED){
      while(WiFiMulti.run() != WL_CONNECTED) {
        digitalWrite(BLUE, LOW);
        digitalWrite(RED, HIGH);
        delay(100);
      }
      String ip = WiFi.localIP().toString();
      USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());
      resetSensorVal();
    }else if(!socketIO.isConnected()){ // 소켓 연결이 끊어지면 다시 시도
      socketIO.begin(server, 8000, "/socket.io/?EIO=4");
      socketIO.onEvent(socketIOEvent);
      delay(100);
      resetSensorVal();
    }else{
      socketIO.loop();
      uint64_t now = millis();
      getSensorVal();
      
      delay(50);
      
      digitalWrite(BLUE, HIGH);
      digitalWrite(RED, LOW);
      if(now - messageTimestamp > Interval && sensorval.count > 0) {
          messageTimestamp = now;
  
          int count = sensorval.count;
          sensorval.temperature = sensorval.temperature / count;
          sensorval.humidity = sensorval.humidity / count;
          sensorval.co = sensorval.co / count;
          sensorval.propane = sensorval.propane / count;
          
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
          param1["propane"] = sensorval.propane;
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
    sensorval.propane = 0;
    sensorval.flame = 1;
    sensorval.vibration = 1;
    sensorval.count = 0;
}
void getSensorVal(){
    sensors_event_t event;  
    //온도값 얻기
    dht.temperature().getEvent(&event);
    sensorval.temperature += event.temperature;
    //습도값 얻기
    dht.humidity().getEvent(&event);
    sensorval.humidity += event.relative_humidity;
    //ProPane값 얻기
    MQ2.update();
    MQ2.setA(658.71); MQ2.setB(-2.168); // set for Propane
    sensorval.propane += MQ2.readSensor();
    //CO값 얻기
    MQ2.setA(36974); MQ2.setB(-3.109); // set for CO
    sensorval.co += MQ2.readSensor();
    //진동값 얻기
    if(sensorval.vibration == 0||digitalRead(SWPIN) == 0)
      sensorval.vibration = 0;
    else
      sensorval.vibration = 1;  
    //불꽃센서 정보 얻기
    if(sensorval.flame == 0||digitalRead(FLAMEPIN) == 0)
      sensorval.flame = 0;
    else
      sensorval.flame = 1;
    sensorval.count++;
}
