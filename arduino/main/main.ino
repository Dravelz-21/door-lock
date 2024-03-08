#include <MFRC522.h>
#include <SPI.h>

MFRC522 mfrc522(10, 9);
const int relay = 2;
void setup() {
    Serial.begin(9600);
    SPI.begin();
    mfrc522.PCD_Init();
    pinMode(relay, OUTPUT);
    digitalWrite(relay, HIGH);
    Serial.println("arduino_on");
}

void rfid() {
{
  if(!mfrc522.PICC_IsNewCardPresent())
  {
    return;
  }
  if(!mfrc522.PICC_ReadCardSerial())
  {
    return;
  }
  String uid="";
  Serial.println();
  Serial.print("UID=");
  for(int i=0;i<mfrc522.uid.size;i++)
  {
    Serial.print(mfrc522.uid.uidByte[i]<0x10 ? "0" : "");
    Serial.print(mfrc522.uid.uidByte[i],HEX);
    uid.concat(String(mfrc522.uid.uidByte[i]<0x10 ? "0" : ""));
    uid.concat(String(mfrc522.uid.uidByte[i],HEX));
  }
  uid.toUpperCase();
  if(uid=="") // UUID of rfid cards that are allowed
  {
    unlock();
    delay(5000);
    lock();
  }
  else
  {
    Serial.println(""); // 
    Serial.println("not_in_list");
  }
  return;
  }
}

void rpi(){
    if(Serial.available()){
      String data = Serial.readStringUntil('\n');
      if(data == "unlock"){
        unlock();
      }
      if(data == "lock"){
        lock();
      }
      return;
    }
}

void lock() {
    digitalWrite(relay, HIGH);
    Serial.println(""); // 
    Serial.println("relay_off");
}

void unlock() {
    digitalWrite(relay, LOW);
    Serial.println(""); // 
    Serial.println("relay_on");
}

void loop() {
    rpi();
    rfid();
}
