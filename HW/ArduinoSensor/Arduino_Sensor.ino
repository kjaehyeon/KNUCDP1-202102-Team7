#include <dht11.h>
#include <SPI.h>
#include <MFRC522.h>

#define DHTPIN 2
#define GasPIN 3
#define FirePIN 4
#define BuzzerPIN 5
#define SS_PIN 10
#define RST_PIN 9

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
byte nuidPICC[4];
char* nullTag;
bool delayFlag;
dht11 DHT11;

void setup() {
  pinMode(BuzzerPIN, OUTPUT);
  Serial.begin(9600);
  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522
  nullTag = "FFFFFFFF";
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
}


/* 출력 형식: FFFFFFFF#22#50#0#0\r\n
 * rfid#온도#습도#불꽃#가스
 */

void loop() {

  /* 온습도 측정 */
  DHT11.read(DHTPIN);

  /* RFID */
  printRfid();
  Serial.print('#');

  /* 온도 */
  Serial.print(DHT11.temperature);
  Serial.print('#');

  /* 습도 */
  Serial.print(DHT11.humidity);
  Serial.print('#');

  /* 불꽃 */
  Serial.print(!digitalRead(FirePIN));
  Serial.print('#');

  /* 가스 */
  Serial.print(!digitalRead(GasPIN));
  Serial.println();

  /* 부저 */
  if (delayFlag) { buzzer(); delay(700); }
  else delay(1000);
}


void printRfid() {
  if ( rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    // Check is the PICC of Classic MIFARE type
    MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
    if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&
      piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
      piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
      Serial.print(nullTag);
      return;
    }
    if (rfid.uid.uidByte[0] != nuidPICC[0] ||
      rfid.uid.uidByte[1] != nuidPICC[1] ||
      rfid.uid.uidByte[2] != nuidPICC[2] ||
      rfid.uid.uidByte[3] != nuidPICC[3] ) {

      // Store NUID into nuidPICC array
      for (byte i = 0; i < 4; i++) {
        nuidPICC[i] = rfid.uid.uidByte[i];
      }

      printHex(rfid.uid.uidByte, rfid.uid.size);
      delayFlag = true;

    } else Serial.print(nullTag);

    // Halt PICC
    rfid.PICC_HaltA();

    // Stop encryption on PCD
    rfid.PCD_StopCrypto1();
  }
  else Serial.print(nullTag);
}

void printHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    if (buffer[i] < 0x10) Serial.print(0);
    Serial.print(buffer[i], HEX);
  }
}

void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    if (buffer[i] < 0x10) Serial.print(0);
    Serial.print(buffer[i], DEC);
  }
}

void buzzer() {
  digitalWrite(BuzzerPIN, HIGH);
  delay(300);
  digitalWrite(BuzzerPIN, LOW);
  delayFlag = false;
}
