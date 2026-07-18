# NurseHub — منصة التمريض المنزلي في مصر

موقع متكامل (HTML/CSS/JS فقط، بدون أي إطار عمل) مربوط بـ Firebase:
Firestore + Authentication + رسائل تنبيه (Cloud Messaging اختياري). لا يستخدم Firebase Storage.

## 📁 هيكل الملفات

```
nursehub/
├── index.html            الصفحة الرئيسية
├── register.html         تسجيل ممرض جديد
├── profile.html          صفحة الممرض (?id=xxx)
├── search.html           البحث المتقدم
├── notifications.html    مركز الإشعارات
├── admin.html            لوحة الإدارة (مخفية)
├── firebase-config.js    إعداد Firebase المشترك
├── app.js                أدوات JS مشتركة (الهيدر، الفوتر، الوضع الليلي...)
├── style.css             نظام التصميم الكامل
├── firestore.rules       قواعد أمان Firestore (انسخها للكونسول)
└── firestore.indexes.json فهارس Firestore المطلوبة
```

> ملاحظة: تم الاستغناء عن Firebase Storage بالكامل (لأنه لا يعمل حاليًا).
> صورة الممرض تُضغط في المتصفح وتُحفظ كنص Base64 مباشرة داخل حقل
> `photoURL` في مستند الممرض بقاعدة Firestore — فلا حاجة لتفعيل Storage إطلاقًا.

## 🚀 خطوات التشغيل

### 1) تفعيل خدمات Firebase
في [Firebase Console](https://console.firebase.google.com) لمشروع `students-699de`:
- **Authentication** → Sign-in method → فعّل "Email/Password".
- **Firestore Database** → Create database (اختر Production mode، واختر أقرب موقع خادم لك).
- **Storage غير مطلوب** في هذه النسخة (تم استبداله بحفظ الصور كـ Base64 داخل Firestore).

### 2) إنشاء حساب المشرف
في Authentication → Users → Add user، أنشئ بريدًا وكلمة مرور للمشرف.
هذا هو الحساب الذي سيُستخدم لتسجيل الدخول في `admin.html`.

### 3) رفع قواعد الأمان
افتح Firestore → Rules، الصق محتوى `firestore.rules` بالكامل، ثم اضغط Publish.

### 4) إنشاء الفهارس (Indexes)
الموقع يستخدم استعلامات مركّبة (فلاتر + ترتيب معًا)، لذا تحتاج فهارس مركّبة.
أسهل طريقة: شغّل الموقع واستخدم البحث المتقدم بكل توليفة فلاتر مرة —
في كل مرة يعطيك Firestore رسالة خطأ بها رابط مباشر لإنشاء الفهرس المطلوب تلقائيًا، فقط اضغط الرابط.
أو، إذا كنت تستخدم Firebase CLI:
```
firebase deploy --only firestore:indexes
```
(باستخدام ملف `firestore.indexes.json` المرفق).

### 5) رفع الموقع
الموقع ثابت بالكامل (Static)، يمكن رفعه على:
- Firebase Hosting: `firebase deploy --only hosting`
- أو أي استضافة ثابتة أخرى (Netlify, Vercel, GitHub Pages...).

> ⚠️ يجب رفع الموقع على HTTPS حتى تعمل كاميرا الرفع و Cloud Messaging بشكل صحيح.

## 🔐 الوصول للوحة الإدارة
لوحة الإدارة **مخفية** ولا تظهر في أي قائمة تنقل ظاهرة. للوصول إليها:
- اضغط 5 مرات متتالية على النقطة الصغيرة (•) بجانب حقوق النشر أسفل أي صفحة، وستنقلك تلقائيًا إلى `admin.html`.
- أو افتح الرابط مباشرة: `yourdomain.com/admin.html`
- سجّل الدخول ببيانات حساب المشرف الذي أنشأته في الخطوة 2.

## 🔔 تفعيل الإشعارات الفورية (Cloud Messaging) — اختياري
النظام الحالي يعرض الإشعارات داخل "مركز الإشعارات" فورًا بدون أي إعداد إضافي.
لتفعيل push notifications الحقيقية على الجوال حتى والموقع مغلق، تحتاج:
1. في Firebase Console → Project settings → Cloud Messaging → أنشئ **Web Push certificate (VAPID key)**.
2. أضف ملف `firebase-messaging-sw.js` في جذر الموقع (service worker).
3. مرّر الـ VAPID key عند استدعاء `getToken()` من `firebase-messaging`.
هذه الخطوة تحتاج نطاقًا (domain) حقيقيًا يعمل على HTTPS، لذلك تُركت اختيارية حتى ترفع الموقع فعليًا.

## 🗂️ بنية البيانات في Firestore

| Collection | الوصف |
|---|---|
| `nurses` | البيانات العامة لكل ممرض (بدون الرقم القومي) |
| `nurses_private` | الرقم القومي فقط — قراءة للمشرف حصريًا |
| `ratings` | تقييمات الزوار (اسم، نجوم، تعليق، معرّف الجهاز) |
| `ads` | الإعلانات المُدارة من لوحة التحكم |
| `notifications` | الإشعارات المُرسلة (للجميع أو لممرض محدد) |

## 🛡️ ملاحظات أمان
- الرقم القومي محفوظ في مستند منفصل (`nurses_private`) لا تسمح قواعد الأمان بقراءته إلا من حساب المشرف المسجّل دخوله.
- منع تكرار التقييم لنفس الممرض يتم عبر `localStorage` على جهاز الزائر (لا يوجد تسجيل دخول للزوار كما طُلب).
- كل التعديلات الحساسة (قبول/رفض/تعديل/حذف/توثيق/حظر/إعلانات/إشعارات) تتطلب مصادقة المشرف.
- صور الممرضين تُحفظ كنص Base64 داخل مستند Firestore مباشرة، لذا لا حاجة لتفعيل Firebase Storage أو نشر قواعد أمان خاصة به.
