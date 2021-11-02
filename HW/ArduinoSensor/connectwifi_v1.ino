#include"WiFiEsp.h"

void setup()
{
  // Open Serial1 communications and wait for port to open:
  Serial3.begin(9600);
  Serial3.setTimeout(5000);
  Serial.begin(9600); 
  Serial.println("ESP8266 AT command test");  
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
