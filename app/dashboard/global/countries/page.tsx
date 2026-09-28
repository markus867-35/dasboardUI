"use client";

import React, { useState, useMemo } from 'react';
import { FiSearch, FiGlobe, FiMapPin, FiFlag, FiSun, FiMoon } from 'react-icons/fi';
import Swal from 'sweetalert2';

interface CountryItem {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  code: string;
  phoneCode: string;
  flagUrl: string;
}

const ALL_COUNTRIES: CountryItem[] = [
  { name: "Afghanistan", capital: "Kabul", region: "Asia", subregion: "Southern Asia", code: "af", phoneCode: "+93", flagUrl: "https://flagcdn.com/af.svg" },
  { name: "Albania", capital: "Tirana", region: "Europe", subregion: "Southern Europe", code: "al", phoneCode: "+355", flagUrl: "https://flagcdn.com/al.svg" },
  { name: "Algeria", capital: "Algiers", region: "Africa", subregion: "Northern Africa", code: "dz", phoneCode: "+213", flagUrl: "https://flagcdn.com/dz.svg" },
  { name: "Andorra", capital: "Andorra la Vella", region: "Europe", subregion: "Southern Europe", code: "ad", phoneCode: "+376", flagUrl: "https://flagcdn.com/ad.svg" },
  { name: "Angola", capital: "Luanda", region: "Africa", subregion: "Middle Africa", code: "ao", phoneCode: "+244", flagUrl: "https://flagcdn.com/ao.svg" },
  { name: "Argentina", capital: "Buenos Aires", region: "Americas", subregion: "South America", code: "ar", phoneCode: "+54", flagUrl: "https://flagcdn.com/ar.svg" },
  { name: "Armenia", capital: "Yerevan", region: "Asia", subregion: "Western Asia", code: "am", phoneCode: "+374", flagUrl: "https://flagcdn.com/am.svg" },
  { name: "Australia", capital: "Canberra", region: "Oceania", subregion: "Australia and New Zealand", code: "au", phoneCode: "+61", flagUrl: "https://flagcdn.com/au.svg" },
  { name: "Austria", capital: "Vienna", region: "Europe", subregion: "Western Europe", code: "at", phoneCode: "+43", flagUrl: "https://flagcdn.com/at.svg" },
  { name: "Azerbaijan", capital: "Baku", region: "Asia", subregion: "Western Asia", code: "az", phoneCode: "+994", flagUrl: "https://flagcdn.com/az.svg" },
  { name: "Bahamas", capital: "Nassau", region: "Americas", subregion: "Caribbean", code: "bs", phoneCode: "+1242", flagUrl: "https://flagcdn.com/bs.svg" },
  { name: "Bahrain", capital: "Manama", region: "Asia", subregion: "Western Asia", code: "bh", phoneCode: "+973", flagUrl: "https://flagcdn.com/bh.svg" },
  { name: "Bangladesh", capital: "Dhaka", region: "Asia", subregion: "Southern Asia", code: "bd", phoneCode: "+880", flagUrl: "https://flagcdn.com/bd.svg" },
  { name: "Belarus", capital: "Minsk", region: "Europe", subregion: "Eastern Europe", code: "by", phoneCode: "+375", flagUrl: "https://flagcdn.com/by.svg" },
  { name: "Belgium", capital: "Brussels", region: "Europe", subregion: "Western Europe", code: "be", phoneCode: "+32", flagUrl: "https://flagcdn.com/be.svg" },
  { name: "Belize", capital: "Belmopan", region: "Americas", subregion: "Central America", code: "bz", phoneCode: "+501", flagUrl: "https://flagcdn.com/bz.svg" },
  { name: "Benin", capital: "Porto-Novo", region: "Africa", subregion: "Western Africa", code: "bj", phoneCode: "+229", flagUrl: "https://flagcdn.com/bj.svg" },
  { name: "Bhutan", capital: "Thimphu", region: "Asia", subregion: "Southern Asia", code: "bt", phoneCode: "+975", flagUrl: "https://flagcdn.com/bt.svg" },
  { name: "Bolivia", capital: "Sucre", region: "Americas", subregion: "South America", code: "bo", phoneCode: "+591", flagUrl: "https://flagcdn.com/bo.svg" },
  { name: "Bosnia and Herzegovina", capital: "Sarajevo", region: "Europe", subregion: "Southern Europe", code: "ba", phoneCode: "+387", flagUrl: "https://flagcdn.com/ba.svg" },
  { name: "Botswana", capital: "Gaborone", region: "Africa", subregion: "Southern Africa", code: "bw", phoneCode: "+267", flagUrl: "https://flagcdn.com/bw.svg" },
  { name: "Brazil", capital: "Brasília", region: "Americas", subregion: "South America", code: "br", phoneCode: "+55", flagUrl: "https://flagcdn.com/br.svg" },
  { name: "Brunei", capital: "Bandar Seri Begawan", region: "Asia", subregion: "South-Eastern Asia", code: "bn", phoneCode: "+673", flagUrl: "https://flagcdn.com/bn.svg" },
  { name: "Bulgaria", capital: "Sofia", region: "Europe", subregion: "Eastern Europe", code: "bg", phoneCode: "+359", flagUrl: "https://flagcdn.com/bg.svg" },
  { name: "Cambodia", capital: "Phnom Penh", region: "Asia", subregion: "South-Eastern Asia", code: "kh", phoneCode: "+855", flagUrl: "https://flagcdn.com/kh.svg" },
  { name: "Cameroon", capital: "Yaoundé", region: "Africa", subregion: "Middle Africa", code: "cm", phoneCode: "+237", flagUrl: "https://flagcdn.com/cm.svg" },
  { name: "Canada", capital: "Ottawa", region: "Americas", subregion: "Northern America", code: "ca", phoneCode: "+1", flagUrl: "https://flagcdn.com/ca.svg" },
  { name: "Chile", capital: "Santiago", region: "Americas", subregion: "South America", code: "cl", phoneCode: "+56", flagUrl: "https://flagcdn.com/cl.svg" },
  { name: "China", capital: "Beijing", region: "Asia", subregion: "Eastern Asia", code: "cn", phoneCode: "+86", flagUrl: "https://flagcdn.com/cn.svg" },
  { name: "Colombia", capital: "Bogotá", region: "Americas", subregion: "South America", code: "co", phoneCode: "+57", flagUrl: "https://flagcdn.com/co.svg" },
  { name: "Croatia", capital: "Zagreb", region: "Europe", subregion: "Southern Europe", code: "hr", phoneCode: "+385", flagUrl: "https://flagcdn.com/hr.svg" },
  { name: "Cuba", capital: "Havana", region: "Americas", subregion: "Caribbean", code: "cu", phoneCode: "+53", flagUrl: "https://flagcdn.com/cu.svg" },
  { name: "Cyprus", capital: "Nicosia", region: "Europe", subregion: "Southern Europe", code: "cy", phoneCode: "+357", flagUrl: "https://flagcdn.com/cy.svg" },
  { name: "Czech Republic", capital: "Prague", region: "Europe", subregion: "Eastern Europe", code: "cz", phoneCode: "+420", flagUrl: "https://flagcdn.com/cz.svg" },
  { name: "Denmark", capital: "Copenhagen", region: "Europe", subregion: "Northern Europe", code: "dk", phoneCode: "+45", flagUrl: "https://flagcdn.com/dk.svg" },
  { name: "Ecuador", capital: "Quito", region: "Americas", subregion: "South America", code: "ec", phoneCode: "+593", flagUrl: "https://flagcdn.com/ec.svg" },
  { name: "Egypt", capital: "Cairo", region: "Africa", subregion: "Northern Africa", code: "eg", phoneCode: "+20", flagUrl: "https://flagcdn.com/eg.svg" },
  { name: "Estonia", capital: "Tallinn", region: "Europe", subregion: "Northern Europe", code: "ee", phoneCode: "+372", flagUrl: "https://flagcdn.com/ee.svg" },
  { name: "Ethiopia", capital: "Addis Ababa", region: "Africa", subregion: "Eastern Africa", code: "et", phoneCode: "+251", flagUrl: "https://flagcdn.com/et.svg" },
  { name: "Fiji", capital: "Suva", region: "Oceania", subregion: "Melanesia", code: "fj", phoneCode: "+679", flagUrl: "https://flagcdn.com/fj.svg" },
  { name: "Finland", capital: "Helsinki", region: "Europe", subregion: "Northern Europe", code: "fi", phoneCode: "+358", flagUrl: "https://flagcdn.com/fi.svg" },
  { name: "France", capital: "Paris", region: "Europe", subregion: "Western Europe", code: "fr", phoneCode: "+33", flagUrl: "https://flagcdn.com/fr.svg" },
  { name: "Germany", capital: "Berlin", region: "Europe", subregion: "Western Europe", code: "de", phoneCode: "+49", flagUrl: "https://flagcdn.com/de.svg" },
  { name: "Greece", capital: "Athens", region: "Europe", subregion: "Southern Europe", code: "gr", phoneCode: "+30", flagUrl: "https://flagcdn.com/gr.svg" },
  { name: "Hungary", capital: "Budapest", region: "Europe", subregion: "Eastern Europe", code: "hu", phoneCode: "+36", flagUrl: "https://flagcdn.com/hu.svg" },
  { name: "India", capital: "New Delhi", region: "Asia", subregion: "Southern Asia", code: "in", phoneCode: "+91", flagUrl: "https://flagcdn.com/in.svg" },
  { name: "Indonesia", capital: "Jakarta", region: "Asia", subregion: "South-Eastern Asia", code: "id", phoneCode: "+62", flagUrl: "https://flagcdn.com/id.svg" },
  { name: "Iran", capital: "Tehran", region: "Asia", subregion: "Southern Asia", code: "ir", phoneCode: "+98", flagUrl: "https://flagcdn.com/ir.svg" },
  { name: "Iraq", capital: "Baghdad", region: "Asia", subregion: "Western Asia", code: "iq", phoneCode: "+964", flagUrl: "https://flagcdn.com/iq.svg" },
  { name: "Ireland", capital: "Dublin", region: "Europe", subregion: "Northern Europe", code: "ie", phoneCode: "+353", flagUrl: "https://flagcdn.com/ie.svg" },
  { name: "Israel", capital: "Jerusalem", region: "Asia", subregion: "Western Asia", code: "il", phoneCode: "+972", flagUrl: "https://flagcdn.com/il.svg" },
  { name: "Italy", capital: "Rome", region: "Europe", subregion: "Southern Europe", code: "it", phoneCode: "+39", flagUrl: "https://flagcdn.com/it.svg" },
  { name: "Japan", capital: "Tokyo", region: "Asia", subregion: "Eastern Asia", code: "jp", phoneCode: "+81", flagUrl: "https://flagcdn.com/jp.svg" },
  { name: "Jordan", capital: "Amman", region: "Asia", subregion: "Western Asia", code: "jo", phoneCode: "+962", flagUrl: "https://flagcdn.com/jo.svg" },
  { name: "Kazakhstan", capital: "Astana", region: "Asia", subregion: "Central Asia", code: "kz", phoneCode: "+7", flagUrl: "https://flagcdn.com/kz.svg" },
  { name: "Kenya", capital: "Nairobi", region: "Africa", subregion: "Eastern Africa", code: "ke", phoneCode: "+254", flagUrl: "https://flagcdn.com/ke.svg" },
  { name: "Kuwait", capital: "Kuwait City", region: "Asia", subregion: "Western Asia", code: "kw", phoneCode: "+965", flagUrl: "https://flagcdn.com/kw.svg" },
  { name: "Laos", capital: "Vientiane", region: "Asia", subregion: "South-Eastern Asia", code: "la", phoneCode: "+856", flagUrl: "https://flagcdn.com/la.svg" },
  { name: "Malaysia", capital: "Kuala Lumpur", region: "Asia", subregion: "South-Eastern Asia", code: "my", phoneCode: "+60", flagUrl: "https://flagcdn.com/my.svg" },
  { name: "Mexico", capital: "Mexico City", region: "Americas", subregion: "North America", code: "mx", phoneCode: "+52", flagUrl: "https://flagcdn.com/mx.svg" },
  { name: "Morocco", capital: "Rabat", region: "Africa", subregion: "Northern Africa", code: "ma", phoneCode: "+212", flagUrl: "https://flagcdn.com/ma.svg" },
  { name: "Myanmar", capital: "Naypyidaw", region: "Asia", subregion: "South-Eastern Asia", code: "mm", phoneCode: "+95", flagUrl: "https://flagcdn.com/mm.svg" },
  { name: "Netherlands", capital: "Amsterdam", region: "Europe", subregion: "Western Europe", code: "nl", phoneCode: "+31", flagUrl: "https://flagcdn.com/nl.svg" },
  { name: "New Zealand", capital: "Wellington", region: "Oceania", subregion: "Australia and New Zealand", code: "nz", phoneCode: "+64", flagUrl: "https://flagcdn.com/nz.svg" },
  { name: "Nigeria", capital: "Abuja", region: "Africa", subregion: "Western Africa", code: "ng", phoneCode: "+234", flagUrl: "https://flagcdn.com/ng.svg" },
  { name: "North Korea", capital: "Pyongyang", region: "Asia", subregion: "Eastern Asia", code: "kp", phoneCode: "+850", flagUrl: "https://flagcdn.com/kp.svg" },
  { name: "Norway", capital: "Oslo", region: "Europe", subregion: "Northern Europe", code: "no", phoneCode: "+47", flagUrl: "https://flagcdn.com/no.svg" },
  { name: "Oman", capital: "Muscat", region: "Asia", subregion: "Western Asia", code: "om", phoneCode: "+968", flagUrl: "https://flagcdn.com/om.svg" },
  { name: "Pakistan", capital: "Islamabad", region: "Asia", subregion: "Southern Asia", code: "pk", phoneCode: "+92", flagUrl: "https://flagcdn.com/pk.svg" },
  { name: "Palestine", capital: "Ramallah", region: "Asia", subregion: "Western Asia", code: "ps", phoneCode: "+970", flagUrl: "https://flagcdn.com/ps.svg" },
  { name: "Philippines", capital: "Manila", region: "Asia", subregion: "South-Eastern Asia", code: "ph", phoneCode: "+63", flagUrl: "https://flagcdn.com/ph.svg" },
  { name: "Poland", capital: "Warsaw", region: "Europe", subregion: "Eastern Europe", code: "pl", phoneCode: "+48", flagUrl: "https://flagcdn.com/pl.svg" },
  { name: "Portugal", capital: "Lisbon", region: "Europe", subregion: "Southern Europe", code: "pt", phoneCode: "+351", flagUrl: "https://flagcdn.com/pt.svg" },
  { name: "Qatar", capital: "Doha", region: "Asia", subregion: "Western Asia", code: "qa", phoneCode: "+974", flagUrl: "https://flagcdn.com/qa.svg" },
  { name: "Romania", capital: "Bucharest", region: "Europe", subregion: "Eastern Europe", code: "ro", phoneCode: "+40", flagUrl: "https://flagcdn.com/ro.svg" },
  { name: "Russia", capital: "Moscow", region: "Europe", subregion: "Eastern Europe", code: "ru", phoneCode: "+7", flagUrl: "https://flagcdn.com/ru.svg" },
  { name: "Saudi Arabia", capital: "Riyadh", region: "Asia", subregion: "Western Asia", code: "sa", phoneCode: "+966", flagUrl: "https://flagcdn.com/sa.svg" },
  { name: "Singapore", capital: "Singapore", region: "Asia", subregion: "South-Eastern Asia", code: "sg", phoneCode: "+65", flagUrl: "https://flagcdn.com/sg.svg" },
  { name: "South Africa", capital: "Pretoria", region: "Africa", subregion: "Southern Africa", code: "za", phoneCode: "+27", flagUrl: "https://flagcdn.com/za.svg" },
  { name: "South Korea", capital: "Seoul", region: "Asia", subregion: "Eastern Asia", code: "kr", phoneCode: "+82", flagUrl: "https://flagcdn.com/kr.svg" },
  { name: "Spain", capital: "Madrid", region: "Europe", subregion: "Southern Europe", code: "es", phoneCode: "+34", flagUrl: "https://flagcdn.com/es.svg" },
  { name: "Sweden", capital: "Stockholm", region: "Europe", subregion: "Northern Europe", code: "se", phoneCode: "+46", flagUrl: "https://flagcdn.com/se.svg" },
  { name: "Switzerland", capital: "Bern", region: "Europe", subregion: "Western Europe", code: "ch", phoneCode: "+41", flagUrl: "https://flagcdn.com/ch.svg" },
  { name: "Syria", capital: "Damascus", region: "Asia", subregion: "Western Asia", code: "sy", phoneCode: "+963", flagUrl: "https://flagcdn.com/sy.svg" },
  { name: "Taiwan", capital: "Taipei", region: "Asia", subregion: "Eastern Asia", code: "tw", phoneCode: "+886", flagUrl: "https://flagcdn.com/tw.svg" },
  { name: "Thailand", capital: "Bangkok", region: "Asia", subregion: "South-Eastern Asia", code: "th", phoneCode: "+66", flagUrl: "https://flagcdn.com/th.svg" },
  { name: "Turkey", capital: "Ankara", region: "Asia", subregion: "Western Asia", code: "tr", phoneCode: "+90", flagUrl: "https://flagcdn.com/tr.svg" },
  { name: "Ukraine", capital: "Kyiv", region: "Europe", subregion: "Eastern Europe", code: "ua", phoneCode: "+380", flagUrl: "https://flagcdn.com/ua.svg" },
  { name: "United Arab Emirates", capital: "Abu Dhabi", region: "Asia", subregion: "Western Asia", code: "ae", phoneCode: "+971", flagUrl: "https://flagcdn.com/ae.svg" },
  { name: "United Kingdom", capital: "London", region: "Europe", subregion: "Northern Europe", code: "gb", phoneCode: "+44", flagUrl: "https://flagcdn.com/gb.svg" },
  { name: "United States", capital: "Washington, D.C.", region: "Americas", subregion: "Northern America", code: "us", phoneCode: "+1", flagUrl: "https://flagcdn.com/us.svg" },
  { name: "Vatican City", capital: "Vatican City", region: "Europe", subregion: "Southern Europe", code: "va", phoneCode: "+379", flagUrl: "https://flagcdn.com/va.svg" },
  { name: "Vietnam", capital: "Hanoi", region: "Asia", subregion: "South-Eastern Asia", code: "vn", phoneCode: "+84", flagUrl: "https://flagcdn.com/vn.svg" },
  { name: "Yemen", capital: "Sana'a", region: "Asia", subregion: "Western Asia", code: "ye", phoneCode: "+967", flagUrl: "https://flagcdn.com/ye.svg" }
];

export default function CountryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default mode gelap

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  // Fungsi SweetAlert2 dengan warna yang menyesuaikan tema terang/gelap
  const handleFlagClick = (item: CountryItem) => {
    Swal.fire({
      title: `<span class="${isDarkMode ? 'text-sky-400' : 'text-sky-600'}">${item.name}</span>`,
      html: `
        <div class="flex flex-col items-center gap-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}">
          <img src="${item.flagUrl}" alt="Bendera ${item.name}" class="w-28 h-20 object-cover rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} shadow-md" />
          <div class="w-full text-left ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} p-4 rounded-xl space-y-2 text-sm border">
            <p><strong>Ibu Kota:</strong> <span class="${isDarkMode ? 'text-sky-300' : 'text-sky-600'}">${item.capital}</span></p>
            <p><strong>Kawasan:</strong> <span class="${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}">${item.region} (${item.subregion})</span></p>
            <p><strong>Kode Telepon:</strong> <span class="font-mono ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}">${item.phoneCode}</span></p>
            <p><strong>Kode Negara:</strong> <span class="uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">${item.code}</span></p>
          </div>
        </div>
      `,
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#0284c7',
      customClass: {
        popup: `border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-2xl shadow-2xl`,
      }
    });
  };

  const filteredCountries = useMemo(() => {
    return ALL_COUNTRIES.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phoneCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || item.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header & Tombol Toggle Dark/Light Mode */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 transition-colors duration-300 border-slate-700/50">
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-3 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
              <FiGlobe /> Direktori Negara di Dunia
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Klik pada bendera negara untuk melihat detail informasi lengkap.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tombol Toggle Mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition border shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-white text-sky-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {isDarkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
              <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>

            <div className={`px-4 py-2 rounded-xl text-sm border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
              Total: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{filteredCountries.length} Negara</strong>
            </div>
          </div>
        </div>

        {/* Pencarian dan Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama negara, ibu kota, atau kode telepon (contoh: +62)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                  selectedRegion === region
                    ? 'bg-sky-600 text-white shadow-sky-600/30'
                    : isDarkMode 
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List Negara */}
        {filteredCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCountries.map((item, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-5 transition duration-200 hover:shadow-lg flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-slate-800/60 border-slate-700/70 hover:border-sky-500/50' 
                    : 'bg-white border-slate-200 hover:border-sky-400 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      isDarkMode 
                        ? 'bg-slate-700/60 text-sky-400 border-slate-600/50' 
                        : 'bg-sky-50 text-sky-700 border-sky-100'
                    }`}>
                      {item.region}
                    </span>
                    
                    {/* Kotak Bendera yang bisa diklik */}
                    <div 
                      onClick={() => handleFlagClick(item)}
                      title="Klik untuk melihat detail"
                      className={`w-12 h-9 rounded-lg overflow-hidden border shadow-sm flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition transform duration-150 ${
                        isDarkMode ? 'bg-slate-700 border-slate-600 hover:border-sky-400' : 'bg-slate-100 border-slate-300 hover:border-sky-500'
                      }`}
                    >
                      {item.flagUrl ? (
                        <img
                          src={item.flagUrl}
                          alt={`Bendera ${item.name}`}
                          className="w-full h-full object-cover pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">{item.code.toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.name}</h3>
                  
                  <div className={`mt-3 space-y-1.5 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-sky-500 shrink-0" size={14} />
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Ibu Kota:</span>
                      <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{item.capital}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiFlag className="text-emerald-500 shrink-0" size={14} />
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Sub-kawasan:</span>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.subregion}</span>
                    </div>
                  </div>
                </div>

                <div className={`mt-5 pt-3 border-t flex justify-between items-center text-xs ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>Kode Telepon:</span>
                  <span className={`font-mono px-2.5 py-1 rounded font-semibold border ${
                    isDarkMode 
                      ? 'bg-slate-900 text-sky-400 border-slate-800' 
                      : 'bg-slate-100 text-sky-600 border-slate-200'
                  }`}>
                    {item.phoneCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-2xl ${isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <FiGlobe className="mx-auto text-slate-400 text-5xl mb-3" />
            <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Negara tidak ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}