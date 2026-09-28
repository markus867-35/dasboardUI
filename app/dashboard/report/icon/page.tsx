'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { 
  FiAlertCircle, FiActivity, FiBarChart2, FiClipboard, FiGrid, 
  FiCompass, FiFileText, FiHeart, FiMove, FiEdit3, 
  FiBookOpen, FiMail, FiTarget, FiBook, FiMaximize2, 
  FiEye, FiEyeOff, FiFilePlus, FiMaximize, FiSend, 
  FiLayers, FiGlobe, FiGlobe as FiLanguage, FiExternalLink, FiList, 
  FiLock, FiMessageSquare, FiDollarSign, FiList as FiNested, FiKey, FiFile, 
  FiUser, FiUsers, FiUserCheck, FiSearch, FiShoppingCart,
  FiTrash2, FiTrash, FiSettings, FiSliders, FiPhone, FiPhoneCall,
  FiMoreHorizontal, FiMoreVertical, FiStar, FiShoppingBag, FiBox,
  FiAlertTriangle, FiHelpCircle, FiInfo, FiMinusCircle, FiPlusCircle,
  FiCheckCircle, FiXCircle, FiZoomIn, FiZoomOut, FiMinus, FiPlus,
  FiCheck, FiX, FiLifeBuoy, FiCircle
} from 'react-icons/fi';

interface IconItem {
  name: string;
  icon: React.ReactNode;
}

export default function IconsPage() {
  const { mode } = useTheme();
  const [activeTab, setActiveTab] = useState<'icons' | 'element'>('icons');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Daftar ikon tab "Icons"
  const iconList: IconItem[] = [
    { name: '404', icon: <FiAlertCircle className="w-8 h-8" /> },
    { name: 'bug', icon: <FiActivity className="w-8 h-8" /> },
    { name: 'chart', icon: <FiBarChart2 className="w-8 h-8" /> },
    { name: 'clipboard', icon: <FiClipboard className="w-8 h-8" /> },
    { name: 'component', icon: <FiGrid className="w-8 h-8" /> },
    { name: 'dashboard', icon: <FiCompass className="w-8 h-8" /> },
    { name: 'documentation', icon: <FiFileText className="w-8 h-8" /> },
    { name: 'donate', icon: <FiHeart className="w-8 h-8" /> },
    { name: 'drag', icon: <FiMove className="w-8 h-8" /> },
    { name: 'edit', icon: <FiEdit3 className="w-8 h-8" /> },
    { name: 'education', icon: <FiBookOpen className="w-8 h-8" /> },
    { name: 'email', icon: <FiMail className="w-8 h-8" /> },
    { name: 'example', icon: <FiTarget className="w-8 h-8" /> },
    { name: 'excel', icon: <FiBook className="w-8 h-8" /> },
    { name: 'exit-fullscreen', icon: <FiMaximize2 className="w-8 h-8" /> },
    { name: 'eye-open', icon: <FiEye className="w-8 h-8" /> },
    { name: 'eye', icon: <FiEyeOff className="w-8 h-8" /> },
    { name: 'form', icon: <FiFilePlus className="w-8 h-8" /> },
    { name: 'fullscreen', icon: <FiMaximize className="w-8 h-8" /> },
    { name: 'guide', icon: <FiSend className="w-8 h-8" /> },
    { name: 'icon', icon: <FiLayers className="w-8 h-8" /> },
    { name: 'international', icon: <FiGlobe className="w-8 h-8" /> },
    { name: 'language', icon: <FiLanguage className="w-8 h-8" /> },
    { name: 'link', icon: <FiExternalLink className="w-8 h-8" /> },
    { name: 'list', icon: <FiList className="w-8 h-8" /> },
    { name: 'lock', icon: <FiLock className="w-8 h-8" /> },
    { name: 'message', icon: <FiMessageSquare className="w-8 h-8" /> },
    { name: 'money', icon: <FiDollarSign className="w-8 h-8" /> },
    { name: 'nested', icon: <FiNested className="w-8 h-8" /> },
    { name: 'password', icon: <FiKey className="w-8 h-8" /> },
    { name: 'pdf', icon: <FiFile className="w-8 h-8" /> },
    { name: 'people', icon: <FiUser className="w-8 h-8" /> },
    { name: 'peoples', icon: <FiUsers className="w-8 h-8" /> },
    { name: 'qq', icon: <FiUserCheck className="w-8 h-8" /> },
    { name: 'search', icon: <FiSearch className="w-8 h-8" /> },
    { name: 'shopping', icon: <FiShoppingCart className="w-8 h-8" /> },
  ];

  // Daftar ikon khusus tab "Element-UI Icons" sesuai gambar referensi
  const elementIconList: IconItem[] = [
    { name: 'platform-eleme', icon: <FiLayers className="w-7 h-7" /> },
    { name: 'eleme', icon: <FiCircle className="w-7 h-7" /> },
    { name: 'delete-solid', icon: <FiTrash2 className="w-7 h-7" /> },
    { name: 'delete', icon: <FiTrash className="w-7 h-7" /> },
    { name: 's-tools', icon: <FiSettings className="w-7 h-7" /> },
    { name: 'setting', icon: <FiSliders className="w-7 h-7" /> },
    { name: 'user-solid', icon: <FiUser className="w-7 h-7" /> },
    { name: 'user', icon: <FiUserCheck className="w-7 h-7" /> },
    { name: 'phone', icon: <FiPhone className="w-7 h-7" /> },
    { name: 'phone-outline', icon: <FiPhoneCall className="w-7 h-7" /> },
    { name: 'more', icon: <FiMoreHorizontal className="w-7 h-7" /> },
    { name: 'more-outline', icon: <FiMoreVertical className="w-7 h-7" /> },
    { name: 'star-on', icon: <FiStar className="w-7 h-7 fill-current" /> },
    { name: 'star-off', icon: <FiStar className="w-7 h-7" /> },
    { name: 's-goods', icon: <FiShoppingBag className="w-7 h-7" /> },
    { name: 'goods', icon: <FiBox className="w-7 h-7" /> },
    { name: 'warning', icon: <FiAlertTriangle className="w-7 h-7" /> },
    { name: 'warning-outline', icon: <FiAlertCircle className="w-7 h-7" /> },
    { name: 'question', icon: <FiHelpCircle className="w-7 h-7" /> },
    { name: 'info', icon: <FiInfo className="w-7 h-7" /> },
    { name: 'remove', icon: <FiMinusCircle className="w-7 h-7" /> },
    { name: 'circle-plus', icon: <FiPlusCircle className="w-7 h-7" /> },
    { name: 'success', icon: <FiCheckCircle className="w-7 h-7" /> },
    { name: 'error', icon: <FiXCircle className="w-7 h-7" /> },
    { name: 'zoom-in', icon: <FiZoomIn className="w-7 h-7" /> },
    { name: 'zoom-out', icon: <FiZoomOut className="w-7 h-7" /> },
    { name: 'remove-outline', icon: <FiMinus className="w-7 h-7" /> },
    { name: 'circle-plus-outline', icon: <FiPlus className="w-7 h-7" /> },
    { name: 'circle-check', icon: <FiCheck className="w-7 h-7" /> },
    { name: 'circle-close', icon: <FiX className="w-7 h-7" /> },
    { name: 's-help', icon: <FiLifeBuoy className="w-7 h-7" /> },
    { name: 'help', icon: <FiCompass className="w-7 h-7" /> },
    { name: 'minus', icon: <FiMinus className="w-7 h-7" /> },
    { name: 'plus', icon: <FiPlus className="w-7 h-7" /> },
    { name: 'check', icon: <FiCheck className="w-7 h-7" /> },
    { name: 'close', icon: <FiX className="w-7 h-7" /> },
  ];

  const getContainerStyle = () => {
    return mode === 'light' 
      ? 'bg-white text-slate-800 border-slate-200' 
      : 'bg-[#16222A] text-slate-100 border-slate-800';
  };

  const getCardHoverStyle = () => {
    return mode === 'light'
      ? 'hover:bg-slate-50 hover:border-slate-300'
      : 'hover:bg-[#1e2d38] hover:border-slate-700';
  };

  const handleCopySvg = (name: string) => {
    const textToCopy = `<svg-icon icon-class="${name}" />`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(name);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleCopyElement = (name: string) => {
    const textToCopy = `<i class="el-icon-${name}" />`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(name);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-10xl mx-auto relative">
<Link 
  href="/dashboard/report/icon/addicon" 
  className={`block p-4 rounded-xl border text-sm text-blue-600 bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400 transition-all cursor-pointer hover:shadow-sm hover:opacity-90`}
>
  Add and use
</Link>

      <div className={`rounded-2xl border shadow-sm ${getContainerStyle()}`}>
        {/* Tab Header */}
        <div className="flex border-b border-inherit px-6 pt-4 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('icons')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'icons' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Icons
          </button>
          <button
            onClick={() => setActiveTab('element')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'element' 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Element-UI Icons
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'icons' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {iconList.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border border-transparent transition-all cursor-pointer group ${getCardHoverStyle()}`}
                  onClick={() => handleCopySvg(item.name)}
                  title={`Salin: <svg-icon icon-class="${item.name}" />`}
                >
                  {copiedText === item.name && (
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                      &lt;svg-icon icon-class=&quot;{item.name}&quot; /&gt;
                    </div>
                  )}
                  <div className="mb-3 transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <span className="text-xs opacity-75 text-center truncate w-full">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {elementIconList.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border border-transparent transition-all cursor-pointer group ${getCardHoverStyle()}`}
                  onClick={() => handleCopyElement(item.name)}
                  title={`Salin: <i class="el-icon-${item.name}" />`}
                >
                  {copiedText === item.name && (
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                      &lt;i class=&quot;el-icon-{item.name}&quot; /&gt;
                    </div>
                  )}
                  <div className="mb-3 transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <span className="text-xs opacity-75 text-center truncate w-full">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}