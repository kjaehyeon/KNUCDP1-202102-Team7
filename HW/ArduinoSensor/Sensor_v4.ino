
#include "WiFiEsp.h"
#include <DHT.h>
#include <Adafruit_Sensor.h>
#include <DHT_U.h>
#include <MQUnifiedsensor.h>

char ssid[]= "raspi-webgui";           // your network SSID (name)
char pass[] = "autoin1020";        // your network password
int status = WL_IDLE_STATUS;     // the Wifi radio's status
char server[] = "192.168.50.1";
int socket_status;
WiFiEspClient client;

//for DHT-22
#define DHTPIN            2     //DATA Pin 
#define DHTTYPE           DHT22 //DHT22 라고 TYPE을 정의함

//for MQ-2
#define Board             ("Arduino MEGA")
#define MQ2PIN            A4
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
#define SWPIN A2
//for Flame sensor
#define FLAMPIN 4
//dht 클랙서 생성 (Data Pin, Sensor Type)


DHT_Unified dht(DHTPIN, DHTTYPE);
//MQ2 생성
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ2PIN, MQTYPE);

float ppm1; //propane
float ppm2; //CO

unsigned long lastConnectionTime = 0;         // last time you connected to the server, in milliseconds
const unsigned long postingInterval = 700L; // delay between updates, in milliseconds

void setup()
{
    Serial.begin(9600);
    Serial3.begin(115200);
    //led pin 설정
    pinMode(RED, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);
    
    digitalWrite(BLUE, LOW);
    delay(100);
    digitalWrite(RED, HIGH);
    
    WiFi.init(&Serial3);
    // Wifi 연결
    while ( status != WL_CONNECTED ) {
        Serial.print("Attempting to connect to WPA SSID: ");
        Serial.println(ssid);
        // Connect to WPA/WPA2 network
        status = WiFi.begin(ssid, pass);
    }
    printWifiStatus();
    
    //DHT22 시작
    dht.begin();
    sensor_t sensor;
    dht.temperature().getSensor(&sensor);
    dht.humidity().getSensor(&sensor);

    //MQ2 시작
    MQ2.setRegressionMethod(1); //_PPM =  a*ratio^b
    MQ2.setA(658.71); MQ2.setB(-2.222); // set for Propane
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

  
    MQ2.serialDebug(true);

    pinMode(SWPIN,INPUT);
    pinMode(FLAMPIN,INPUT);

    if (client.connect(server, 8000)) {
        Serial.println("Connected to server");
    }
}

void loop()
{   
    digitalWrite(RED, LOW);
    digitalWrite(BLUE, HIGH);
    
   
    if (millis() - lastConnectionTime > postingInterval) {
    httpReq();
  }
  
}

void httpReq(){
  status = WiFi.status();
    //socket_status = client.connected();
    if(status != WL_CONNECTED){
      setup(); //wifi 꺼지면 다시 setup
    }
    
    sensors_event_t event;  
    //온도값 얻기
    dht.temperature().getEvent(&event);
    float temp = event.temperature;
    //습도값 얻기
    dht.humidity().getEvent(&event);
    float humi = event.relative_humidity;
    //ProPane값 얻기
    MQ2.update();
    MQ2.setA(658.71); MQ2.setB(-2.168); // set for Propane
    ppm1 = MQ2.readSensor();
    //CO값 얻기
    MQ2.setA(36974); MQ2.setB(-3.109); // set for CO
    ppm2 = MQ2.readSensor();
    //진동값 얻기
    int vib = analogRead(SWPIN);
    //불꽃센서 정보 얻기
    int flame = digitalRead(FLAMPIN);
    
    
    if(client.connected()){  
      String tmp = String("GET /monitoring/sensor_val/?device_id=")+DEVICE_ID+String("&temperature=")+ temp + String("&humidity=")+humi+String("&co=")+ppm2+String("&propane=")+ppm1+String("&flame=")+flame+String("&vibration=")+vib+String(" HTTP/1.1");
      String host = String("Host: ") +server;
      client.println(tmp);
      client.println(host);
      client.println("Connection: keep-alive");
      client.println();
    
      lastConnectionTime = millis();
    }else{
      Serial.print("failed");
      client.connect(server,8000);
    }
    //client.stop();
       
}

void printWifiStatus()
{
    // print the SSID of the network you're attached to
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());
    // print your WiFi shield's IP address
    IPAddress ip = WiFi.localIP();
    Serial.print("IP Address: ");
    Serial.println(ip);
    // print the received signal strength
    long rssi = WiFi.RSSI();
    Serial.print("Signal strength (RSSI):");
    Serial.print(rssi);
    Serial.println(" dBm");
}
