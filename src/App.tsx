import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  BarChart3, 
  History, 
  Settings, 
  Plus, 
  Download, 
  FileText, 
  ChevronRight, 
  Star, 
  MapPin, 
  MessageSquare,
  Building2,
  Box,
  Database,
  CreditCard,
  Gauge,
  Edit3,
  RefreshCw,
  Table,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Brand, Material, Hotspot, AnalysisResult, BudgetEntry, Showroom } from './types';
import { BrandLibrary } from './components/BrandLibrary';
import { ShowroomMap } from './components/ShowroomMap';
import { DataCenter } from './components/DataCenter';
import { dataStore } from './store/dataStore';
import { mockShowrooms } from './data/mockData';
import { locales, Language, getLocale } from './locales';

// 创建国际化 Hook
const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'zh'
  );
  
  const t = getLocale(language);
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  return { t, language, changeLanguage };
};

export default function App() {
  const { t, language, changeLanguage } = useTranslation();
  
  const [view, setView] = useState<'dashboard' | 'analysis' | 'report'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // New states for settings and brand DB
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isBrandDbOpen, setIsBrandDbOpen] = useState(false);
  const [isAppSettingOpen, setIsAppSettingOpen] = useState(false);
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);

  // AI Settings
  const [visionModel, setVisionModel] = useState<string>(localStorage.getItem('visionModel') || 'qwen3-vl-plus');
  const [imageModel, setImageModel] = useState<string>(localStorage.getItem('imageModel') || 'wanx2.1-t2i-turbo');
  const [qwenApiKey, setQwenApiKey] = useState<string>(localStorage.getItem('qwenApiKey') || 'sk-b48577b26a94459bb602dfbc89470365');

  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: '',
    category: t.flooring,
    sub_category: t.solidWoodFlooring,
    material_type: t.solidWoodFlooring,
    model: '',
    price: 0,
    supplier: '',
    unit: 'm²'
  });

  // Measure container size
  useEffect(() => {
    if (imageContainerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerRect(entry.contentRect);
        }
      });
      observer.observe(imageContainerRef.current);
      return () => observer.disconnect();
    }
  }, [view, analysisResult]);

  // 计算图片在容器中的实际渲染位置
  const getImageRenderRect = () => {
    if (!containerRect) return null;
    
    const containerW = containerRect.width;
    const containerH = containerRect.height;
    
    const imgW = imageWidth || containerW;
    const imgH = imageHeight || containerH;
    const imgRatio = imgW / imgH;
    const containerRatio = containerW / containerH;
    
    let renderW, renderH, offsetX, offsetY;
    
    if (imgRatio > containerRatio) {
      renderW = containerW;
      renderH = containerW / imgRatio;
      offsetX = 0;
      offsetY = (containerH - renderH) / 2;
    } else {
      renderH = containerH;
      renderW = containerH * imgRatio;
      offsetX = (containerW - renderW) / 2;
      offsetY = 0;
    }
    
    return { renderW, renderH, offsetX, offsetY, containerW, containerH };
  };

  // 将图片坐标转换为容器坐标
  const convertHotspotPosition = (spot: Hotspot) => {
    const rawX = spot.rawX ?? (parseFloat(String(spot.x)) || 0);
    const rawY = spot.rawY ?? (parseFloat(String(spot.y)) || 0);
    
    const imgW = (spot as any).aiImageWidth || imageWidth || 2048;
    const imgH = (spot as any).aiImageHeight || imageHeight || 1280;
    
    let percentX: number, percentY: number;
    
    if (rawX <= 100 && rawY <= 100) {
      percentX = rawX;
      percentY = rawY;
    } else {
      percentX = Math.min(100, Math.max(0, (rawX / imgW) * 100));
      percentY = Math.min(100, Math.max(0, (rawY / imgH) * 100));
    }
    
    return { left: `${percentX.toFixed(1)}%`, top: `${percentY.toFixed(1)}%` };
  };

  // Subscribe to dataStore changes
  useEffect(() => {
    setAllBrands(dataStore.getBrands());
    return dataStore.subscribe(() => {
      setAllBrands(dataStore.getBrands());
    });
  }, []);

  // Fetch all brands for the DB modal
  const fetchAllBrands = () => {
    setAllBrands(dataStore.getBrands());
  };

  useEffect(() => {
    if (isBrandDbOpen) {
      fetchAllBrands();
    }
  }, [isBrandDbOpen]);

  const handleNewProject = () => {
    const confirm = window.confirm(t.confirmNewProject);
    if (confirm) {
      setSelectedImage(null);
      setAnalysisResult(null);
      setSelectedHotspot(null);
      setBudgetEntries([]);
      setView('dashboard');
      setIsSettingsDropdownOpen(false);
    }
  };

  const handleSaveBrand = async () => {
    if (!newBrand.name || !newBrand.supplier) {
      alert(t.fillBrandInfo);
      return;
    }
    
    const brandToAdd: Brand = {
      id: allBrands.length + 1,
      name: newBrand.name!,
      category: newBrand.category || t.other,
      sub_category: newBrand.sub_category || newBrand.material_type || t.other,
      material_type: newBrand.material_type || newBrand.sub_category || t.other,
      model: newBrand.model || 'N/A',
      price: newBrand.price || 0,
      unit: newBrand.unit || 'm²',
      supplier: newBrand.supplier!,
      rating: 5.0,
      reviews: 0
    };

    setAllBrands([brandToAdd, ...allBrands]);
    setIsAddingBrand(false);
    setNewBrand({
      name: '',
      category: t.flooring,
      sub_category: t.solidWoodFlooring,
      material_type: t.solidWoodFlooring,
      model: '',
      price: 0,
      supplier: '',
      unit: 'm²'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 2048;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          setImageWidth(width);
          setImageHeight(height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.9);
          setSelectedImage(compressed);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setProgress(10);
    setProgressMessage(t.preparingData);
    
    try {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 85) return prev + Math.random() * 5;
          return prev;
        });
      }, 800);

      setProgressMessage(t.identifyingSpace);
      
      const imgW = imageWidth || 2048;
      const imgH = imageHeight || 1280;
      
      const prompt = language === 'zh' 
        ? `分析这张建筑装饰图片。请仔细扫描整张图片，从左到右、从上到下全面覆盖。

请识别以下类型的物品：
1. 建筑装饰材料：地板、墙面、吊顶、门窗
2. 家具：沙发、餐桌、椅子、床、衣柜等

⚠️ 关键要求：
- 必须扫描图片的整个宽度，包括左侧、中间和右侧区域
- 每个物品一个热点，坐标是物品的中心点像素坐标
- 坐标基于图片左上角原点，x向右增加(0到图片宽度)，y向下增加(0到图片高度)
- 确保热点在x轴上均匀分布，覆盖整张图片

返回 JSON 格式：
{ 
  "imageWidth": 你看到的图片宽度像素值,
  "imageHeight": 你看到的图片高度像素值,
  "hotspots": [
    { "id": "1", "x": 像素x坐标, "y": 像素y坐标, "materialName": "分类名", "materialType": "具体材料名" }
  ], 
  "materials": [
    { "id": 1, "name": "材料名", "type": "大类", "characteristics": "特点1,特点2", "base_price_min": 100, "base_price_max": 300, "install_price_min": 20, "install_price_max": 50 }
  ]
}`
        : language === 'ja'
        ? `この建築装飾画像を分析してください。画像全体を左から右、上から下へ完全にスキャンしてください。

以下のタイプのアイテムを識別してください：
1. 建築装飾材料：床、壁、天井、ドア・窓
2. 家具：ソファ、ダイニングテーブル、椅子、ベッド、ワードローブなど

⚠️ 重要な要件：
- 画像の全幅をスキャンし、左側、中央、右側の領域を含める
- 各アイテムに1つのホットスポット、座標はアイテムの中心点のピクセル座標
- 座標は画像の左上隅を原点とし、xは右に増加(0から画像幅)、yは下に増加(0から画像高さ)
- ホットスポットがx軸上で均等に分布し、画像全体をカバーすることを確認

JSON形式で返してください：
{ 
  "imageWidth": 見ている画像の幅のピクセル値,
  "imageHeight": 見ている画像の高さのピクセル値,
  "hotspots": [
    { "id": "1", "x": ピクセルx座標, "y": ピクセルy座標, "materialName": "カテゴリ名", "materialType": "具体的な材料名" }
  ], 
  "materials": [
    { "id": 1, "name": "材料名", "type": "大カテゴリ", "characteristics": "特徴1,特徴2", "base_price_min": 100, "base_price_max": 300, "install_price_min": 20, "install_price_max": 50 }
  ]
}`
        : `Analyze this architectural decoration image. Please scan the entire image carefully from left to right, top to bottom.

Please identify the following types of items:
1. Architectural decoration materials: flooring, walls, ceiling, doors and windows
2. Furniture: sofa, dining table, chairs, bed, wardrobe, etc.

⚠️ Key requirements:
- Must scan the entire width of the image, including left, middle and right areas
- One hotspot per item, coordinates are the center point pixel coordinates of the item
- Coordinates are based on the upper left corner of the image as origin, x increases to the right (0 to image width), y increases downward (0 to image height)
- Ensure hotspots are evenly distributed on the x-axis, covering the entire image

Return in JSON format:
{ 
  "imageWidth": pixel width of the image you see,
  "imageHeight": pixel height of the image you see,
  "hotspots": [
    { "id": "1", "x": pixel x coordinate, "y": pixel y coordinate, "materialName": "category name", "materialType": "specific material name" }
  ], 
  "materials": [
    { "id": 1, "name": "material name", "type": "main category", "characteristics": "feature1,feature2", "base_price_min": 100, "base_price_max": 300, "install_price_min": 20, "install_price_max": 50 }
  ]
}`;
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: selectedImage,
          prompt,
          apiKey: qwenApiKey,
          model: visionModel
        })
      });

      clearInterval(interval);
      setProgress(90);
      setProgressMessage(t.generatingReport);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      
      const aiImageWidth = result.imageWidth || imageWidth || 2048;
      const aiImageHeight = result.imageHeight || imageHeight || 1280;
      
      // 处理热点 - 去重
      const seenTypes = new Set();
      let hotspots = [];
      for (const spot of (result.hotspots || [])) {
        const type = spot.materialType || spot.materialName;
        if (!seenTypes.has(type)) {
          seenTypes.add(type);
          hotspots.push({
            ...spot,
            rawX: parseFloat(spot.x),
            rawY: parseFloat(spot.y),
            aiImageWidth,
            aiImageHeight
          });
        }
      }
      
      // 处理材料 - 去重
      const seenMaterialNames = new Set();
      let materials = [];
      for (const m of (result.materials || [])) {
        if (!seenMaterialNames.has(m.name)) {
          seenMaterialNames.add(m.name);
          materials.push(m);
        }
      }
      
      // 如果材料数不等于热点数，从热点生成材料
      if (materials.length !== hotspots.length) {
        materials = hotspots.map((spot, i) => ({
          id: i + 1,
          name: spot.materialType || spot.materialName || `${t.materials.replace(/项|items|項目/, '')}${i + 1}`,
          type: spot.materialName || t.other,
          characteristics: language === 'zh' ? '环保,耐用,美观' : language === 'ja' ? '環境に優しい,耐久性,美観' : 'Eco-friendly,Durable,Aesthetic',
          base_price_min: 100,
          base_price_max: 300,
          install_price_min: 30,
          install_price_max: 80
        }));
      }
      
      setAnalysisResult({
        imageUrl: selectedImage,
        hotspots: hotspots,
        materials: materials
      });
      
      // Initialize budget entries
      const initialBudget = result.materials.map((m: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        materialName: m.name,
        quantity: 0,
        unit: 'm²',
        unitPrice: (m.base_price_min + m.base_price_max) / 2,
        totalPrice: 0
      }));
      setBudgetEntries(initialBudget);
      
      setView('analysis');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`${t.analysisFailed}: ${error instanceof Error ? error.message : t.unknownError}`);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleMaterialChangeRequest = async () => {
    if (!changeRequest || !selectedImage) return;
    setIsGeneratingImage(true);
    setProgress(10);
    setProgressMessage(t.submittingTask);
    setShowChangeModal(false);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: selectedImage,
          prompt: language === 'zh'
            ? `建筑装饰效果图修改。原始图片描述：室内空间。用户修改要求：${changeRequest}。请根据要求生成一张高质量的室内装饰效果图。`
            : language === 'ja'
            ? `建築装飾レンダリングの変更。元の画像説明：インテリアスペース。ユーザーの変更要求：${changeRequest}。高品質なインテリアレンダリングを生成してください。`
            : `Architectural decoration rendering modification. Original image description: interior space. User modification request: ${changeRequest}. Please generate a high-quality interior decoration rendering based on the requirements.`,
          apiKey: qwenApiKey,
          model: imageModel
        })
      });

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 2;
          return prev;
        });
        setProgressMessage(prev => {
          if (progress < 40) return t.thinkingLayout;
          if (progress < 70) return t.renderingDetails;
          return t.postProcessing;
        });
      }, 1000);

      if (!response.ok) {
        clearInterval(interval);
        const errorData = await response.json();
        throw new Error(errorData.error || "Image generation failed");
      }

      const result = await response.json();
      clearInterval(interval);
      setProgress(95);
      setProgressMessage(t.applyingEffect);
      const newImageUrl = result.image;

      if (newImageUrl) {
        setSelectedImage(newImageUrl);
        await startAnalysis();
      }
      setProgress(100);
    } catch (error) {
      console.error("Image generation failed:", error);
      alert(`${t.imageGenFailed}: ${error instanceof Error ? error.message : t.unknownError}`);
    } finally {
      setIsGeneratingImage(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleRevitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const revitData = results.data as any[];
          const updatedEntries = budgetEntries.map(entry => {
            const match = revitData.find(row => 
              Object.values(row).some(val => 
                typeof val === 'string' && val.toLowerCase().includes(entry.materialName.toLowerCase())
              )
            );
            if (match) {
              const qty = parseFloat(match.Quantity || match.Area || match.Amount || "0");
              return {
                ...entry,
                quantity: qty,
                totalPrice: qty * entry.unitPrice
              };
            }
            return entry;
          });
          setBudgetEntries(updatedEntries);
        }
      });
    }
  };

  const updateBudgetEntry = (id: string, field: keyof BudgetEntry, value: any) => {
    const updated = budgetEntries.map(entry => {
      if (entry.id === id) {
        const newEntry = { ...entry, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          newEntry.totalPrice = newEntry.quantity * newEntry.unitPrice;
        }
        return newEntry;
      }
      return entry;
    });
    setBudgetEntries(updated);
  };

  const totalBudget = budgetEntries.reduce((sum, entry) => sum + entry.totalPrice, 0);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">{t.appTitle}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.appSubtitle}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => setView('dashboard')} className={`transition-colors ${view === 'dashboard' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}>{t.dashboard}</button>
            <button onClick={() => setView('analysis')} className={`transition-colors ${view === 'analysis' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`} disabled={!analysisResult}>{t.analysisDetail}</button>
            <button onClick={() => setView('report')} className={`transition-colors ${view === 'report' ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`} disabled={!analysisResult}>{t.budgetReport}</button>
          </nav>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                className={`p-2 rounded-full transition-colors ${isSettingsDropdownOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {isSettingsDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsSettingsDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[70] overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={handleNewProject}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> {t.newProject}
                        </button>
                        <button 
                          onClick={() => { setIsBrandDbOpen(true); setIsSettingsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Database className="w-4 h-4" /> {t.brandDatabase}
                        </button>
                        <div className="h-px bg-slate-800 my-1" />
                        <button 
                          onClick={() => { setIsAppSettingOpen(true); setIsSettingsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" /> {t.settings}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setIsDataCenterOpen(true)}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"
              title={t.dataCenter}
            >
              <Database className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className={`max-w-[1920px] mx-auto p-6 ${view !== 'dashboard' ? 'pb-40' : ''}`}>
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{t.projectDashboard}</h2>
                  <p className="text-slate-400 mt-1">{t.dashboardDesc}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-sm font-bold hover:bg-slate-700 transition-colors">
                    <History className="w-4 h-4" /> {t.history}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <div className={`aspect-[16/9] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 overflow-hidden ${selectedImage ? 'border-blue-500/50 bg-slate-900' : 'border-slate-800 bg-slate-900/50 hover:border-blue-500/30'}`}>
                      {selectedImage ? (
                        <>
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                              {t.changeImage}
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500">
                            <Upload className="w-10 h-10" />
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold">{t.uploadRender}</p>
                            <p className="text-slate-500 mt-2">{t.supportedFormats}</p>
                          </div>
                          <label className="cursor-pointer bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all">
                            {t.selectFile}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={startAnalysis}
                    disabled={!selectedImage || isAnalyzing}
                    className="w-full mt-6 h-16 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 shadow-2xl shadow-blue-600/20 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {t.analyzing}
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-6 h-6" />
                        {t.startAnalysis}
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">{t.recentAnalysis}</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
                          <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden shrink-0">
                            <img src={`https://picsum.photos/seed/arch${i}/200/200`} alt="Recent" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">{t.modernLivingRoom} {i}</p>
                            <p className="text-xs text-slate-500 mt-1">2024-03-10 • 120m²</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg">{t.proFeatures}</h3>
                      <p className="text-blue-100 text-sm mt-2">{t.proFeaturesDesc}</p>
                      <button className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">{t.upgradeNow}</button>
                    </div>
                    <Building2 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'analysis' && analysisResult && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Image & Hotspots */}
              <div className="lg:col-span-8 space-y-6">
                <div ref={imageContainerRef} className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                  <img src={analysisResult.imageUrl} alt="Analysis" className="w-full h-auto object-contain" />
                  
                  {/* Hotspots */}
                  {analysisResult.hotspots && analysisResult.hotspots.length > 0 && (
                    analysisResult.hotspots.map(spot => {
                      const pos = convertHotspotPosition(spot);
                      return (
                        <button 
                          key={spot.id}
                          onClick={() => setSelectedHotspot(spot)}
                          style={{ left: pos.left, top: pos.top }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                        >
                          <span className="relative flex h-8 w-8">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedHotspot?.id === spot.id ? 'bg-blue-400' : 'bg-white'}`}></span>
                            <span className={`relative inline-flex rounded-full h-8 w-8 items-center justify-center shadow-2xl border-2 transition-all ${selectedHotspot?.id === spot.id ? 'bg-blue-600 border-white scale-110' : 'bg-white border-blue-600'}`}>
                              {selectedHotspot?.id === spot.id ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-blue-600" />}
                            </span>
                          </span>
                          <div className={`absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap transition-all ${selectedHotspot?.id === spot.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{spot.materialName}</p>
                          </div>
                        </button>
                      );
                    })
                  )}

                  {/* Analysis Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t.aiConfidence}</span>
                        <span className="text-sm font-bold text-emerald-400">98.2% {t.accuracy}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-700" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t.identifiedItems}</span>
                        <span className="text-sm font-bold">{analysisResult.materials?.length || 0} {t.materials}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowChangeModal(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> {t.changeMaterial}
                      </button>
                      <button 
                        onClick={() => setView('report')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <FileText className="w-4 h-4" /> {t.generateReport}
                      </button>
                    </div>
                  </div>

                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                      <p className="text-xl font-bold">{t.regenerating}</p>
                    </div>
                  )}
                </div>

                {/* Material Details */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                  {selectedHotspot ? (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{selectedHotspot.materialName}</h3>
                          <p className="text-slate-400 mt-1">{t.category}：<span className="text-blue-400 font-medium">{selectedHotspot.materialType}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">{language === 'zh' ? '已选中' : language === 'ja' ? '選択済み' : 'Selected'}</span>
                        </div>
                      </div>

                      {(() => {
                        const matchedMaterial = analysisResult.materials.find(m => 
                          m.name === selectedHotspot.materialType || 
                          m.name.includes(selectedHotspot.materialType) ||
                          selectedHotspot.materialType.includes(m.name)
                        );
                        
                        return matchedMaterial ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                              <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">{t.estimatedPrice}</p>
                              <p className="text-lg font-bold text-blue-400">¥{matchedMaterial.base_price_min} - ¥{matchedMaterial.base_price_max}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                              <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">{t.installCost}</p>
                              <p className="text-lg font-bold">¥{matchedMaterial.install_price_min} - ¥{matchedMaterial.install_price_max}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                              <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">{t.ecoLevel}</p>
                              <p className="text-lg font-bold">E0 / EN13986</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                              <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">{t.maintenanceCycle}</p>
                              <p className="text-lg font-bold">3-5 {t.years}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.materialFeatures}</h4>
                            <div className="flex flex-wrap gap-2">
                              {matchedMaterial.characteristics.split(',').map((char, i) => (
                                <span 
                                  key={i} 
                                  className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20"
                                >
                                  {char.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                        ) : (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-400">{t.noPriceInfo}</p>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <Plus className="w-8 h-8" />
                      </div>
                      <p className="font-medium">{t.clickHotspot}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Brand Library */}
              <div className="lg:col-span-4 space-y-6">
                <div 
                  className="sticky top-24 flex flex-col gap-6"
                  style={{ height: imageHeight ? `${imageHeight}px` : 'auto' }}
                >
                  <div className="flex-1 overflow-hidden">
                    <BrandLibrary 
                      brands={allBrands}
                      maxHeight={imageHeight ? `${imageHeight - 160}px` : '600px'} 
                      initialCategory={selectedHotspot?.materialType}
                      broadCategory={selectedHotspot?.materialName}
                    />
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shrink-0">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" /> {t.nearbyShowrooms}
                    </h3>
                    <div className="space-y-3">
                      {mockShowrooms.slice(0, 2).map(sr => (
                        <div 
                          key={sr.id} 
                          onClick={() => setSelectedShowroom(sr)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{sr.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sr.address}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-blue-400">{sr.distance}</p>
                            <ChevronRight className="w-3 h-3 text-slate-600 ml-auto mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                      {t.viewAllShowrooms} 12 {t.showrooms}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'report' && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{t.budgetSummary}</h2>
                  <p className="text-slate-400 mt-1">{t.budgetSummaryDesc}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/20">
                    <FileSpreadsheet className="w-4 h-4" /> {t.importRevit}
                    <input type="file" className="hidden" accept=".csv" onChange={handleRevitUpload} />
                  </label>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
                    <Download className="w-4 h-4" /> {t.exportPDF}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Table className="w-5 h-5 text-blue-500" /> {t.quantityList}
                      </h3>
                      <span className="text-xs text-slate-500">{t.totalMaterials} {budgetEntries.length} {language === 'zh' ? '项' : language === 'ja' ? '項目' : 'items'}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-800/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800">
                            <th className="px-6 py-4">{t.materialName}</th>
                            <th className="px-6 py-4">{t.quantity}</th>
                            <th className="px-6 py-4">{t.unit}</th>
                            <th className="px-6 py-4">{t.unitPrice} (¥)</th>
                            <th className="px-6 py-4 text-right">{t.totalPrice} (¥)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {budgetEntries.map(entry => (
                            <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 font-medium">{entry.materialName}</td>
                              <td className="px-6 py-4">
                                <input 
                                  type="number" 
                                  value={entry.quantity}
                                  onChange={(e) => updateBudgetEntry(entry.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-20 bg-slate-800 border-slate-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-sm">{entry.unit}</td>
                              <td className="px-6 py-4">
                                <input 
                                  type="number" 
                                  value={entry.unitPrice}
                                  onChange={(e) => updateBudgetEntry(entry.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  className="w-24 bg-slate-800 border-slate-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-blue-400">¥{entry.totalPrice.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-800/20">
                            <td colSpan={4} className="px-6 py-6 text-right font-bold text-slate-400 uppercase tracking-widest text-xs">{t.totalBudget}</td>
                            <td className="px-6 py-6 text-right text-2xl font-black text-white">¥{totalBudget.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-6">{t.costAnalysis}</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={budgetEntries.filter(e => e.totalPrice > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="totalPrice"
                            nameKey="materialName"
                          >
                            {budgetEntries.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {budgetEntries.filter(e => e.totalPrice > 0).map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 5] }} />
                            <span className="text-slate-400">{entry.materialName}</span>
                          </div>
                          <span className="font-bold">{((entry.totalPrice / totalBudget) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">{t.budgetHealth}</h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-emerald-400">{t.budgetInRange}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{t.budgetInRangeDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Material Change Modal */}
      <AnimatePresence>
        {showChangeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChangeModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowChangeModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold mb-2">{t.changeMaterialTitle}</h3>
              <p className="text-slate-400 text-sm mb-6">{t.changeMaterialDesc}</p>
              
              <div className="space-y-4">
                <textarea 
                  value={changeRequest}
                  onChange={(e) => setChangeRequest(e.target.value)}
                  placeholder={t.changeMaterialPlaceholder}
                  className="w-full h-32 bg-slate-800 border-slate-700 rounded-2xl p-4 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowChangeModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-slate-800 font-bold hover:bg-slate-700 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleMaterialChangeRequest}
                    disabled={!changeRequest}
                    className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> {t.regenerate}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Brand Database Modal */}
      <AnimatePresence>
        {isBrandDbOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBrandDbOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">{t.brandDbTitle}</h3>
                </div>
                <button 
                  onClick={() => setIsBrandDbOpen(false)}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isAddingBrand ? (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4 mb-6">
                    <h4 className="font-bold text-lg">{t.addBrand}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.brandName}</label>
                        <input 
                          type="text" 
                          value={newBrand.name}
                          onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                          placeholder={t.brandNamePlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.mainCategory}</label>
                        <select 
                          value={newBrand.category}
                          onChange={(e) => setNewBrand({...newBrand, category: e.target.value})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                        >
                          <option value={t.flooring}>{t.flooring}</option>
                          <option value={t.tile}>{t.tile}</option>
                          <option value={t.paint}>{t.paint}</option>
                          <option value={t.bathroom}>{t.bathroom}</option>
                          <option value={t.lighting}>{t.lighting}</option>
                          <option value={t.hardware}>{t.hardware}</option>
                          <option value={t.furniture}>{t.furniture}</option>
                          <option value={t.kitchenAppliance}>{t.kitchenAppliance}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.subCategory}</label>
                        <input 
                          type="text" 
                          value={newBrand.sub_category}
                          onChange={(e) => setNewBrand({...newBrand, sub_category: e.target.value, material_type: e.target.value})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                          placeholder={t.subCategoryPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.modelSpec}</label>
                        <input 
                          type="text" 
                          value={newBrand.model}
                          onChange={(e) => setNewBrand({...newBrand, model: e.target.value})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                          placeholder={t.modelSpecPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.price} (¥)</label>
                        <input 
                          type="number" 
                          value={newBrand.price}
                          onChange={(e) => setNewBrand({...newBrand, price: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t.supplierName}</label>
                        <input 
                          type="text" 
                          value={newBrand.supplier}
                          onChange={(e) => setNewBrand({...newBrand, supplier: e.target.value})}
                          className="w-full bg-slate-900 border-slate-700 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setIsAddingBrand(false)}
                        className="flex-1 py-2 rounded-lg bg-slate-700 font-bold hover:bg-slate-600 transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={handleSaveBrand}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                      >
                        {t.saveBrand}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allBrands.map(brand => (
                      <div key={brand.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{brand.name}</h4>
                            <p className="text-[10px] text-slate-500">{brand.category} · {brand.sub_category} • {brand.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">¥{brand.price}/{brand.unit}</p>
                          <p className="text-[10px] text-slate-500">{brand.supplier}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex gap-3">
                <button 
                  onClick={() => setIsAddingBrand(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all"
                >
                  <Plus className="w-4 h-4" /> {t.newBrand}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
                  <Download className="w-4 h-4" /> {t.importData}
                </button>
                <div className="flex-1" />
                <button 
                  onClick={() => setIsBrandDbOpen(false)}
                  className="px-6 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Settings Modal */}
      <AnimatePresence>
        {isAppSettingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppSettingOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">{t.settingsTitle}</h3>
                </div>
                <button 
                  onClick={() => setIsAppSettingOpen(false)}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.generalSettings}</h4>
                  <div className="space-y-4">
                    {/* Language Selection */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Globe className="w-4 h-4" /> {t.language}
                        </p>
                        <p className="text-[10px] text-slate-500">{t.languageDesc}</p>
                      </div>
                      <select 
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value as Language)}
                        className="bg-slate-800 border-slate-700 rounded-lg text-xs px-3 py-2"
                      >
                        <option value="zh">{t.chinese}</option>
                        <option value="en">{t.english}</option>
                        <option value="ja">{t.japanese}</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{t.defaultCurrency}</p>
                        <p className="text-[10px] text-slate-500">{t.currencyUnit}</p>
                      </div>
                      <select className="bg-slate-800 border-slate-700 rounded-lg text-xs px-3 py-2">
                        <option>{language === 'zh' ? '人民币 (¥)' : language === 'ja' ? '人民元 (¥)' : 'CNY (¥)'}</option>
                        <option>{language === 'zh' ? '美元 ($)' : language === 'ja' ? '米ドル ($)' : 'USD ($)'}</option>
                        <option>{language === 'zh' ? '欧元 (€)' : language === 'ja' ? 'ユーロ (€)' : 'EUR (€)'}</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{t.measurementUnit}</p>
                        <p className="text-[10px] text-slate-500">{t.measurementUnitDesc}</p>
                      </div>
                      <select className="bg-slate-800 border-slate-700 rounded-lg text-xs px-3 py-2">
                        <option>{t.squareMeter} (m²)</option>
                        <option>{t.cubicMeter} (m³)</option>
                        <option>{t.meter} (m)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.aiModelSettings}</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-bold">{t.visionModel}</p>
                      <select 
                        value={visionModel}
                        onChange={(e) => setVisionModel(e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-xs p-2"
                      >
                        <option value="qwen3.5-flash">qwen3.5-flash ({t.recommended})</option>
                        <option value="qwen3-vl-plus">qwen3-vl-plus</option>
                        <option value="qwen-vl-plus">qwen-vl-plus</option>
                        <option value="qwen-vl-max">qwen-vl-max</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold">{t.imageModel}</p>
                      <select 
                        value={imageModel}
                        onChange={(e) => setImageModel(e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-xs p-2"
                      >
                        <option value="wanx2.1-t2i-turbo">wanx2.1-t2i-turbo ({t.recommended})</option>
                        <option value="qwen-image-v1">qwen-image-v1</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold">DashScope {t.apiKey}</p>
                      <div className="relative">
                        <input 
                          type="password"
                          value={qwenApiKey}
                          onChange={(e) => setQwenApiKey(e.target.value)}
                          placeholder={t.apiKeyPlaceholder}
                          className="w-full bg-slate-800 border-slate-700 rounded-lg text-xs p-2 pr-10"
                        />
                        <Key className="absolute right-3 top-2 w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-[10px] text-slate-500">{t.apiKeyDesc}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-4 text-slate-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-[10px]">{t.currentVersion}: v1.2.4 (Build 20240310)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex gap-3">
                <button 
                  onClick={() => {
                    localStorage.setItem('visionModel', visionModel);
                    localStorage.setItem('imageModel', imageModel);
                    localStorage.setItem('qwenApiKey', qwenApiKey);
                    setIsAppSettingOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                >
                  {t.saveSettings}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Stats (Sticky) */}
      {view !== 'dashboard' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-6 py-4 z-40">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.currentBudget}</p>
                  <p className="text-lg font-bold">¥{totalBudget.toLocaleString()}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/10 flex items-center justify-center text-amber-500">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t.identifiedMaterials}</p>
                  <p className="text-lg font-bold">{analysisResult?.materials.length || 0} {language === 'zh' ? '项' : language === 'ja' ? '項目' : 'items'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setView('report')}
                className="px-6 py-2 rounded-lg bg-slate-800 text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                {t.viewFullReport}
              </button>
              <button className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                {t.saveProject}
              </button>
            </div>
          </div>
        </footer>
      )}
      <ShowroomMap 
        showroom={selectedShowroom} 
        onClose={() => setSelectedShowroom(null)} 
      />

      {/* Progress Overlay */}
      <AnimatePresence>
        {(isAnalyzing || isGeneratingImage) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
          >
            <div className="w-full max-w-md p-8 text-center space-y-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-blue-600/20 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">{Math.round(progress)}%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isAnalyzing ? t.aiAnalyzing : t.aiGeneratingImage}
                </h3>
                <p className="text-slate-400 text-sm animate-pulse">
                  {progressMessage}
                </p>
              </div>

              <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className={`p-3 rounded-xl border transition-all ${progress > 30 ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                  <div className="text-[10px] font-bold uppercase mb-1">{t.spaceIdentification}</div>
                  <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                </div>
                <div className={`p-3 rounded-xl border transition-all ${progress > 60 ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                  <div className="text-[10px] font-bold uppercase mb-1">{t.materialAnalysis}</div>
                  <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                </div>
                <div className={`p-3 rounded-xl border transition-all ${progress > 90 ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                  <div className="text-[10px] font-bold uppercase mb-1">{t.reportGeneration}</div>
                  <div className="h-1 w-full bg-current opacity-20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Center */}
      <DataCenter isOpen={isDataCenterOpen} onClose={() => setIsDataCenterOpen(false)} />
    </div>
  );
}