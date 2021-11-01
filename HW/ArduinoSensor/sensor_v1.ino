#include <DHT.h>
#include <Adafruit_Sensor.h>
#include <DHT_U.h>
#include <MQUnifiedsensor.h>

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


//for SW-18010
#define SWPIN A2

//for Flame sensor
#define FLAMPIN 4
//dht 클랙서 생성 (Data Pin, Sensor Type)
DHT_Unified dht(DHTPIN, DHTTYPE);
//MQ2 생성
MQUnifiedsensor MQ2(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ2PIN, MQTYPE);

//대기 시간 변수
uint32_t Mydelay = 1000;
float ppm;

void setup() {
  //모니터 프로그램을 위한 시리얼 시작
  Serial.begin(9600); 

  //DHT22 시작
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

  pinMode(SWPIN,INPUT);
  pinMode(FLAMPIN,INPUT);
}
void loop() {
   //대기
  delay(Mydelay);
  
  sensors_event_t event;  
  //온도값 얻기
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    Serial.println("Error reading temperature!");
  }
  else {
    Serial.print("Temperature: ");
    Serial.print(event.temperature);
    Serial.println(" *C");
  }
    
  //습도값 얻기
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println("Error reading humidity!");
  }
  else {
    Serial.print("Humidity: ");
    Serial.print(event.relative_humidity);
    Serial.println("%");
  }

  //LPG값 얻기
  MQ2.update();
  MQ2.setA(574.25); MQ2.setB(-2.222); // set for LPG
  ppm = MQ2.readSensor();
  Serial.print("LPG : ");
  Serial.print(ppm);
  Serial.println("ppm");

  //CO값 얻기
  MQ2.setA(36974); MQ2.setB(-3.109); // set for LPG
  ppm = MQ2.readSensor();
  Serial.print("CO : ");
  Serial.print(ppm);
  Serial.println("ppm");

  Serial.print("vib:");
  Serial.print(analogRead(SWPIN));

  Serial.print("flame:");
  Serial.print(digitalRead(FLAMPIN));
}
