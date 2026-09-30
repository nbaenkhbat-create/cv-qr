# Firebase тохиргоо (DB хадгалагдахын тулд ЗААВАЛ)

Одоогийн CLI аккаунт (`dsnenkhbat@gmail.com`) `cv-qr-6b8d4` дээр эрхгүй тул rules автоматаар deploy хийгдээгүй. **Rules publish хийхгүй бол өгөгдөл DB-д хадгалагдахгүй.**

## 1. Firestore Database үүсгэх

1. https://console.firebase.google.com/project/cv-qr-6b8d4/firestore
2. **Create database** → production mode → location сонго (жишээ: `asia-northeast1`)

## 2. Authentication

1. https://console.firebase.google.com/project/cv-qr-6b8d4/authentication/providers
2. **Email/Password** → Enable

## 3. Authorized domains (GitHub Pages)

1. Authentication → Settings → Authorized domains
2. Нэмэх: `nbaenkhbat-create.github.io`

## 4. Rules publish (хамгийн чухал)

1. https://console.firebase.google.com/project/cv-qr-6b8d4/firestore/rules
2. Repo дахь `firestore.rules` файлын агуулгыг бүгдийг хуулж paste хий
3. **Publish** дарна

## 5. Indexes (CV жагсаалт ажиллахын тулд)

1. https://console.firebase.google.com/project/cv-qr-6b8d4/firestore/indexes
2. Хэрэв асуулга алдаа өгвөл console дээрх линкээр index үүсгэнэ
   - эсвэл `firestore.indexes.json`-ийг CLI-ээр deploy

Эдгээрийг `cv-qr-6b8d4`-ийн **эзэмшигч Google аккаунт**-аар хийнэ.
