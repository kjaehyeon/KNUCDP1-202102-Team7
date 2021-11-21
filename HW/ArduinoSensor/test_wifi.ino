#include"WiFiEsp.h"
#include <ArduinoJson.h>
const char *data1 = "GET /data/2.5/weather?lat=35.8219&lon=128.526&appid=c93ce0a8d46208ba777030a7b68f4947&units=metric";
String data2 = "GET /data/2.5/weather?lat=35.8219&lon=128.526&appid=c93ce0a8d46208ba777030a7b68f4947&units=metric\r\nHost: api.openweathermap.org\r\nConnection: close\r\n";
void setup()
{
  // Open Serial1 communications and wait for port to open:
  Serial3.begin(9600);
  Serial3.setTimeout(5000);
  Serial.begin(9600); 
  Serial.println("ESP8266 AT command test");  
  Serial.println(data2.length());
}

void loop()
{
  // Wifi –> Data –> Serial
  if (Serial3.available()) {
    Serial.write(Serial3.read());
  }
  // Serial –> Data –> Wifi
  if (Serial.available()) {
    Serial3.write(Serial.read());
  }
}
