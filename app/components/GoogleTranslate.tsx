'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GoogleTranslate() {
  const pathname = usePathname();

  useEffect(() => {
    // Fungsi untuk memuat dan menginisialisasi Google Translate
    const initTranslate = () => {
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }

      window.googleTranslateElementInit = () => {
        if (document.getElementById('google_translate_element') && !document.getElementById('google_translate_element').hasChildNodes()) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'id',
              includedLanguages: 'en,ja,es,zh,id',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };

      if (window.google && window.google.translate) {
        const container = document.getElementById('google_translate_element');
        if (container && !container.hasChildNodes()) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'id',
                includedLanguages: 'en,ja,es,zh,id',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              'google_translate_element'
            );
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    initTranslate();
    const timer = setTimeout(initTranslate, 200);

    // PENGAMAN TAMBAHAN: Mencegah body & layout ikut turun ke bawah
    const observer = new MutationObserver(() => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        banner.style.setProperty('display', 'none', 'important');
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <div className="flex items-center">
      <div id="google_translate_element" className="scale-500 origin-right"></div>
    </div>
  );
}