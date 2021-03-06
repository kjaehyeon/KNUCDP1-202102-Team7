#include "WiFiEsp.h"
#include <Servo.h>

#define PIN 2
char ssid[] = "202ho";            // your network SSID (name)
char pass[] = "202mlife12!";        // your network password
int status = WL_IDLE_STATUS;     // the Wifi radio's status
int angle = 90;                //motor initial angle
WiFiEspServer server(1234);    // port 1234
Servo servo;

void setup()
{
  // initialize serial for debugging
  Serial.begin(9600);
  // initialize serial for ESP module
  Serial3.begin(9600);
  //motor start
  servo.attach(PIN);
  // initialize ESP module
  WiFi.init(&Serial3);
  // attempt to connect to WiFi network
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to WPA SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network
    status = WiFi.begin(ssid, pass);
  }
  IPAddress ip = WiFi.localIP();
  server.begin();
  Serial.println(ip);
}

void loop(){
  WiFiEspClient client = server.available();
  if(client){
    while(client.connected()){
      char client_Read = client.read();
      if(client_Read == 'r'){              //r이 오면 오른쪽으로 15도 l이 오면 왼쪽으로 15도 회전
        for(int i = 0; i <15; i++){
          angle = angle +1;
          if(angle >= 180)
          angle = 180;
          servo.write(angle);
          delay(10);
        }
      }
      else if(client_Read == 'l'){
        for(int i = 0; i < 15; i++){
          angle = angle -1;
          if(angle<=0)
          angle = 0;
          servo.write(angle);
          delay(10);
        }
      }
    }
  }
}
