// NOT: Bu metinler hukuki danışmanlık yerine geçmez.
// Yayına almadan önce bir hukuk danışmanına onaylatılmalıdır.
// Şirket unvanı, adres, MERSİS no gibi alanlar placeholder olarak bırakılmıştır.

export const legalDisclaimer =
  "Bu sayfadaki metin taslak niteliğindedir ve hukuki danışmanlık yerine geçmez. Yayına almadan önce bir hukuk danışmanına onaylatılmalıdır.";

export const companyPlaceholder = {
  legalName: "[TİCARİ UNVAN EKLENECEK]",
  mersis: "[MERSİS NO EKLENECEK]",
  address: "[ADRES EKLENECEK]",
  email: "[İLETİŞİM E-POSTASI EKLENECEK]",
  phone: "[TELEFON NUMARASI EKLENECEK]",
};

export const legalPages = {
  gizlilik: {
    title: "Gizlilik Politikası",
    intro:
      "Venti-Ate olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu politika, hangi verilerin toplandığını ve nasıl kullanıldığını açıklamak için hazırlanmış bir taslaktır.",
    sections: [
      { heading: "Toplanan Veriler", body: "[Hangi kişisel verilerin toplandığı buraya eklenecek — ad, e-posta, adres, sipariş geçmişi vb.]" },
      { heading: "Verilerin Kullanım Amacı", body: "[Sipariş işleme, iletişim, pazarlama izni verilmişse bülten gönderimi vb. amaçlar buraya eklenecek.]" },
      { heading: "Veri Saklama Süresi", body: "[Yasal saklama süreleri hukuk danışmanı onayıyla eklenecek.]" },
      { heading: "Haklarınız", body: "[KVKK madde 11 kapsamındaki haklar buraya eklenecek.]" },
    ],
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    intro: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla aydınlatma yükümlülüğümüzü yerine getirmek amacıyla hazırlanmış taslak metindir.",
    sections: [
      { heading: "Veri Sorumlusu", body: `${companyPlaceholder.legalName} — [MERSİS: ${companyPlaceholder.mersis}]` },
      { heading: "İşlenen Kişisel Veriler", body: "[Ad-soyad, iletişim bilgisi, sipariş/ödeme verisi vb. — hukuk danışmanı onayıyla netleştirilecek.]" },
      { heading: "Başvuru Yöntemi", body: `Sorularınız için: ${companyPlaceholder.email}` },
    ],
  },
  cerez: {
    title: "Çerez Politikası",
    intro: "Sitemizde deneyiminizi iyileştirmek için çerezler kullanılmaktadır.",
    sections: [
      { heading: "Zorunlu Çerezler", body: "Sepet ve oturum bilgilerini korumak için kullanılır." },
      { heading: "Analitik Çerezler", body: "[Kullanılacak analiz aracı belirlenince (ör. Vercel Analytics) burada belirtilecek.]" },
    ],
  },
  mesafeliSatis: {
    title: "Mesafeli Satış Sözleşmesi",
    intro: "İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve ilgili yönetmelik kapsamında düzenlenmiş bir taslaktır.",
    sections: [
      { heading: "Taraflar", body: `Satıcı: ${companyPlaceholder.legalName}, ${companyPlaceholder.address}` },
      { heading: "Ürün ve Ödeme Bilgileri", body: "[Sipariş anında oluşturulacak — gerçek ödeme sağlayıcısı entegrasyonu bekleniyor.]" },
      { heading: "Cayma Hakkı", body: "[Yasal cayma hakkı süresi ve koşulları hukuk danışmanı onayıyla eklenecek.]" },
    ],
  },
  onBilgilendirme: {
    title: "Ön Bilgilendirme Formu",
    intro: "Sipariş vermeden önce tüketicinin bilgilendirilmesi amacıyla hazırlanan taslak formdur.",
    sections: [
      { heading: "Satıcı Bilgileri", body: `${companyPlaceholder.legalName} — ${companyPlaceholder.email}` },
      { heading: "Ürün Özellikleri", body: "Ürün sayfalarındaki besin değeri ve içerik bilgileri geçerlidir." },
    ],
  },
  iadeTeslimat: {
    title: "İade ve Teslimat",
    intro: "Gıda ürünü olması nedeniyle iade koşulları özel hükümlere tabidir; nihai metin hukuk danışmanı onayıyla yayınlanmalıdır.",
    sections: [
      { heading: "Teslimat Süresi", body: "[Kargo/teslimat süresi belirlenince eklenecek — DEMO: 2-4 iş günü.]" },
      { heading: "İade Koşulları", body: "[Açılmamış/mühürlü gıda ürünleri için iade koşulları hukuk danışmanıyla netleştirilecek.]" },
    ],
  },
};
