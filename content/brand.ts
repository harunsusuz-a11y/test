// Venti-Ate marka içeriği
// Kaynak: kullanıcının paylaştığı marka kitapçığı (venti-ate_brandbook.pdf)
// Bu dosyadaki hikaye ve değerler brandbook'tan alınmıştır; uydurulmamıştır.
// Eksik ticari bilgiler ([...] içinde) açık placeholder olarak bırakılmıştır.

export const brand = {
  name: "Venti-Ate",
  tagline: "Fındığın rafine hali",

  // Ana sayfa kısa hikaye (brandbook'taki uzun anlatının özeti)
  shortStory:
    "Venti-Ate, sağlıklı yaşamı benimseyen tüketicilere yönelik, Giresun fındığını merkeze alan premium bir atıştırmalık markasıdır. Hem lezzetli hem fonksiyonel — günlük protein ihtiyacını karşılayan, gerçek fındıkla üretilmiş ürünler sunar.",

  // Hakkımızda sayfası uzun hikaye (brandbook metniyle birebir tutarlı, kısaltılmadan)
  fullStory: `Venti-Ate, sağlıklı yaşamı benimseyen tüketicilere yönelik bir sağlıklı atıştırmalık markasıdır. Premium segmentte yer alır. Markanın temel amacı; hem lezzetli hem de fonksiyonel ürün eksikliğini gidermek, tüketicilerin günlük protein ve enerji ihtiyacının bir kısmını karşılayan yüksek kaliteli alternatifler sunmaktır.

Markanın en önemli farklılaştırıcı unsuru, ürünlerinde dünyanın en kaliteli fındığı kabul edilen Giresun fındığını merkeze almasıdır. Üretimde yalnızca yüksek kaliteli hammaddeler kullanılmakla kalmayıp, aynı zamanda markanın kendi fındık kaynaklarını kullanma vizyonu bulunmaktadır. Bu yaklaşım, hem kalite kontrolünü hem de marka hikayesini güçlendiren önemli bir unsurdur.

Hedef kitle; spor yapan, beslenmesine dikkat eden, sağlıklı yaşam tarzını benimseyen yani wellbeing seviyesini yükseltmeyi amaçlayan bireylerden oluşmaktadır. Bu kitle için en önemli değerler; temiz içerik, dengeli besin değerleri ve güçlü lezzet deneyimidir.

Venti-Ate'in marka vizyonu, Türkiye'de sağlıklı atıştırmalık kategorisinde en lezzetli ve kaliteli markalardan biri olarak konumlanmak ve kısa vadede büyük şehirlerde yaygın satış noktalarına ulaşarak bilinirliğini artırmaktır. Orta vadede ise uluslararası pazara girmeyi hedefler.

Özetle Venti-Ate kaliteli içerik, güçlü lezzet ve güvenilir üretim anlayışıyla pazarda yeni bir standart oluşturmayı hedefleyen bir sağlıklı atıştırmalık markasıdır.`,

  values: [
    { title: "Gerçek Kaynak", description: "Giresun fındığı — merkeze aldığımız, taviz vermediğimiz hammadde." },
    { title: "Temiz İçerik", description: "Dengeli besin değerleri, gereksiz katkı yok." },
    { title: "Güçlü Lezzet", description: "İştah açıcı, doğal, aşırı kusursuz food-styling'den uzak." },
    { title: "Sakin Karakter", description: "Fazla kurumsal olmayan ama güven veren, cesur ama temiz bir dil." },
  ],

  // Tone of voice — brandbook'taki "Doğru / Kaçınılmalı" örnekleri
  voiceExamples: [
    { correct: "Fındığın yeni hali.", avoid: "Eşsiz kalitesiyle yeni bir lezzet deneyimi." },
    { correct: "Çıtır çıtır.", avoid: "Çıtır çıtır mutluluk bombası." },
    { correct: "Giresun fındığı. İyi fındık.", avoid: "Karadeniz'in bereketli topraklarından sofralarınıza..." },
    { correct: "Fındık başrolde.", avoid: "Türkiye'nin en kaliteli ve lezzetli fındığı." },
  ],

  contact: {
    email: "[İLETİŞİM E-POSTASI EKLENECEK]",
    phone: "[TELEFON NUMARASI EKLENECEK]",
    address: "[ADRES EKLENECEK]",
  },
  social: {
    instagram: "[INSTAGRAM KULLANICI ADI EKLENECEK]",
    tiktok: "[TIKTOK KULLANICI ADI EKLENECEK]",
    youtube: "[YOUTUBE KANALI EKLENECEK]",
  },

  // Brandbook'ta belirtilmemiş; henüz onaylanmış bir slogan yoksa bu alan boş/placeholder kalmalı
  legalEntity: "[TİCARİ UNVAN EKLENECEK]",
} as const;
