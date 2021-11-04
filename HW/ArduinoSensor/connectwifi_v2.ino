#include "WiFiEsp.h"
String ssid = "raspi-webgui";
String pw = "autoin1020";

void connectWifi(){
  Serial3.println("AT+CWJAP=\""+ssid+"\",\""+pw+"\"");
  delay(15000);
  if(Serial3.find("OK")){
    Serial.println("wifi connect");
  }
  else{
    Serial.println("wifi connect error!");
  }
  delay(1000);
}

void setup() {
  // put your setup code here, to run once:
  Serial3.begin(9600);
  Serial3.setTimeout(5000);
  Serial.begin(9600);
  Serial3.println("AT+CWQAP");
  delay(5000); 
  connectWifi();
}

void loop() {
  // put your main code here, to run repeatedly:
}
