# n8n Workflows for Emerald Commerce (Multi-Tenant WhatsApp)

## 🏗️ البنية المعمارية

```
Meta Cloud API ← → Next.js (API Proxy) ← → n8n
                        ↓
              يقرأ توكن التاجر من Supabase
                        ↓
              يرسل برقم واتساب التاجر 🎯
```

**كل تاجر له رقم واتساب خاص به.** n8n لا يتصل مباشرة بـ WhatsApp API. بدلاً من ذلك، n8n يتصل بـ `POST /api/whatsapp/send` في Next.js، وهو المسؤول عن:
- قراءة توكن واتساب الخاص بالتاجر من `whatsapp_settings`
- إرسال الرسالة عبر Meta Cloud API باستخدام توكن التاجر
- تسجيل الرسالة في `whatsapp_messages`
- **التوكنات لا تغادر الخادم أبداً**

## الاستيراد إلى n8n

1. افتح n8n في المتصفح
2. اذهب إلى **Workflows** ← **Import from File**
3. اختر ملف JSON المناسب من مجلد `workflows/`
4. عدّل الإعدادات التالية لكل workflow:
   - **Supabase credentials** (Project URL + Service Role Key)
   - **HTTP Request node** ← تأكد أن URL يشير إلى `{{$env.APP_URL}}/api/whatsapp/send`
   - **Webhook URLs** ← تأكد أن Webhook URLs تشير إلى خادم n8n الخاص بك

## المتغيرات البيئية في n8n

قم بإنشاء هذه المتغيرات في n8n (Settings → Variables):

| المتغير | الوصف |
|---------|-------|
| `SUPABASE_URL` | رابط مشروع Supabase |
| `SUPABASE_SERVICE_KEY` | Service Role Key من Supabase |
| `APP_URL` | رابط تطبيق Next.js (مثل `https://example.com`) |

> **ملاحظة:** لم يعد هناك متغير `WHATSAPP_PHONE_NUMBER_ID` أو `WHATSAPP_ACCESS_TOKEN` لأن كل تاجر يضيف رقمه بنفسه من لوحة التحكم.

## سير العمل المتاحة (الإصدار 2.0 - متعدد التجار)

### 1. تأكيد الطلب (`order-confirmation.json`)
- يستقبل webhook من Next.js
- يجلب بيانات الطلب والعميل من Supabase
- يرسل رسالة تأكيد عبر `POST /api/whatsapp/send` ← التطبيق يرسلها برقم التاجر
- يسجل الرسالة في `whatsapp_messages`

### 2. ترحيب العميل الجديد (`new-customer-welcome.json`)
- يستقبل webhook من Next.js
- يرسل رسالة ترحيب عبر `POST /api/whatsapp/send` ← برقم التاجر

### 3. توجيه الرسائل الواردة (`incoming-message-router.json`)
- يستقبل رسائل من `POST /api/webhooks/whatsapp`
- يحدد التاجر من `phone_number_id`
- يسجل الرسالة + ينشئ تذكرة دعم لو لزم

### 4. تذكير السلة المهملة (`abandoned-cart-reminder.json`)
- مجدول (مرتين يومياً)
- يجلب الطلبات المعلقة + العملاء
- يرسل تذكير لكل طلب عبر `POST /api/whatsapp/send` ← برقم التاجر

## ربط التاجر لرقم واتسابه

التاجر يذهب إلى **الإعدادات ← واتساب** ويدخل:
1. `Phone Number ID` (من Meta Business)
2. `Access Token` (توكن دائم)
3. `رقم واتساب`

الزر **اختبار الاتصال** يتحقق من صحة البيانات عبر `POST /api/whatsapp/verify`
الزر **حفظ وربط** يخزن البيانات ويسجل webhook عبر `POST /api/whatsapp/register-webhook`

## الأمان

- `POST /api/whatsapp/send` محمي بالمصادقة (ما عدا n8n يستخدم service_role)
- جميع Webhooks يجب أن تستخدم `secret_token` للتحقق
- توكنات واتساب مخزنة في Supabase ولا تغادر الخادم أبداً
- n8n يستخدم `service_role` key للوصول إلى Supabase
- تأكد من أن خادم n8n في شبكة آمنة
