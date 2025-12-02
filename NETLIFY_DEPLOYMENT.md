# Netlify Deployment Guide

Bu rehber, projenizi Netlify'da deploy etmek için gerekli adımları içerir.

## Ön Gereksinimler

- Netlify hesabı (ücretsiz tier yeterli)
- GitHub, GitLab veya Bitbucket'te proje repository'si
- Supabase projesi kurulu ve yapılandırılmış

## Adım 1: Repository Hazırlığı

1. Kodunuzun GitHub/GitLab/Bitbucket'te bir repository'de olduğundan emin olun
2. Environment variable'ların repository'ye commit edilmediğinden emin olun
3. `.gitignore` dosyanızda `.env` dosyalarının ignore edildiğinden emin olun

## Adım 2: Netlify'a Bağlanma

1. [Netlify Dashboard](https://app.netlify.com/)'a giriş yapın
2. **Add new site** > **Import an existing project** seçeneğini tıklayın
3. Git provider'ınızı seçin (GitHub, GitLab, veya Bitbucket)
4. Netlify'ın repository'nize erişim izni verin
5. Projenizi seçin

## Adım 3: Build Ayarları

Netlify otomatik olarak `netlify.toml` dosyasını algılayacaktır. Eğer manuel ayarlamak isterseniz:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (veya daha yüksek)

## Adım 4: Environment Variables Ekleme

Netlify'da environment variable'ları eklemek için:

1. Netlify Dashboard'da projenize gidin
2. **Site settings** > **Environment variables** bölümüne gidin
3. Aşağıdaki değişkenleri ekleyin:

```
VITE_SUPABASE_URL=https://bxhnxfwrumeqvnpwymin.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aG54ZndydW1lcXZucHd5bWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5MDUsImV4cCI6MjA2OTAxODkwNX0.YXWu3lJQkUfo7PLe1NlYy3yTMIUH4SWS_bHcwpG_na0
```

**Önemli:**
- Her değişkeni hem **Production** hem de **Preview** environment'ları için ekleyin
- Değerleri kendi Supabase projenizden alın (yukarıdakiler örnek değerlerdir)

## Adım 5: Deploy

1. **Deploy site** butonuna tıklayın
2. Netlify otomatik olarak build işlemini başlatacaktır
3. Build tamamlandığında (genellikle 2-5 dakika), siteniz canlı olacaktır
4. URL formatı: `your-project-name.netlify.app`

## Adım 6: Custom Domain Ayarlama (Opsiyonel)

1. Netlify Dashboard'da **Domain settings** bölümüne gidin
2. **Add custom domain** butonuna tıklayın
3. Domain adresinizi girin
4. DNS ayarlarını yapın (Netlify size talimat verecektir)

## Yapılandırma Dosyaları

### netlify.toml

Proje root dizininde `netlify.toml` dosyası bulunmaktadır. Bu dosya şunları içerir:

- Build komutu ve ayarları
- SPA (Single Page Application) redirect kuralları
- Güvenlik headers
- Cache ayarları
- CORS headers

### React Router Desteği

Proje React Router kullanıyor, bu yüzden tüm route'lar `index.html`'e yönlendirilir. Bu, `netlify.toml` dosyasında otomatik olarak yapılandırılmıştır.

## Sorun Giderme

### Build Hataları

1. **Node version hatası**: Netlify'da Node.js versiyonunu 18 veya daha yüksek olarak ayarlayın
2. **Dependency hataları**: `package-lock.json` dosyasının commit edildiğinden emin olun
3. **Environment variable hataları**: Tüm gerekli değişkenlerin eklendiğini kontrol edin

### Runtime Hataları

1. **Supabase bağlantı hatası**: Environment variable'ların doğru ayarlandığını kontrol edin
2. **404 hatası**: `netlify.toml` dosyasındaki redirect kurallarının doğru olduğundan emin olun
3. **CORS hatası**: Supabase'de CORS ayarlarını kontrol edin

### Build Logları

1. Netlify Dashboard'da **Deploys** sekmesine gidin
2. İlgili deploy'u seçin
3. **Deploy log** bölümünden detaylı logları görüntüleyin

## Performans Optimizasyonları

Netlify otomatik olarak şunları sağlar:

- ✅ CDN (Content Delivery Network)
- ✅ HTTPS (otomatik SSL sertifikaları)
- ✅ Asset optimization
- ✅ Image optimization (Netlify Image CDN ile)
- ✅ Form handling
- ✅ Serverless functions desteği

## Güvenlik

`netlify.toml` dosyasında aşağıdaki güvenlik headers'ları yapılandırılmıştır:

- X-Frame-Options: Clickjacking koruması
- X-XSS-Protection: XSS koruması
- X-Content-Type-Options: MIME type sniffing koruması
- Referrer-Policy: Referrer bilgisi kontrolü

## Maliyet

Netlify ücretsiz tier şunları içerir:

- ✅ 100 GB bandwidth/ay
- ✅ 300 build dakikası/ay
- ✅ 100 GB form submissions/ay
- ✅ Unlimited sites
- ✅ HTTPS (otomatik)
- ✅ Custom domain desteği

## Sonraki Adımlar

Deploy sonrası:

1. ✅ Site ayarlarını kontrol edin
2. ✅ Analytics ekleyin (opsiyonel)
3. ✅ Form submissions ayarlayın (eğer form kullanıyorsanız)
4. ✅ Monitoring ve alerts yapılandırın
5. ✅ Backup stratejisi oluşturun
6. ✅ Payment webhooks yapılandırın (eğer kullanıyorsanız)

## Destek

- [Netlify Dokümantasyonu](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)
- [Supabase Dokümantasyonu](https://supabase.com/docs)

## Önemli Notlar

⚠️ **Güvenlik Uyarıları:**

- Environment variable'ları asla repository'ye commit etmeyin
- Supabase service role key'i asla client-side'da kullanmayın
- API key'leri sadece Netlify environment variables'da saklayın
- Production'da RLS (Row Level Security) politikalarının aktif olduğundan emin olun

✅ **Best Practices:**

- Her commit'te otomatik deploy yapılır (CI/CD)
- Preview deployments her pull request için oluşturulur
- Branch-based deployments ile farklı environment'lar test edilebilir

