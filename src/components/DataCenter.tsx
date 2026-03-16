import React, { useState, useEffect } from 'react';
import { 
  Database, X, Plus, Edit3, Trash2, Save, Download, Upload, 
  Building2, Package, MapPin, RefreshCw, Search, ChevronRight,
  AlertCircle, CheckCircle2, BarChart3, FileText
} from 'lucide-react';
import { Brand, Material, Showroom } from '../types';
import { dataStore, categoryConfig } from '../store/dataStore';
import { Language, getLocale } from '../locales';

interface DataCenterProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

type TabType = 'overview' | 'brands' | 'materials' | 'showrooms' | 'settings';

export const DataCenter: React.FC<DataCenterProps> = ({ isOpen, onClose, language = 'zh' }) => {
  const t = getLocale(language);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Translations
  const txt = {
    zh: {
      title: '数据中台',
      subtitle: 'Data Management Center',
      overview: '概览',
      brandLibrary: '品牌库',
      materialLibrary: '材料库',
      showroom: '展厅',
      settings: '设置',
      close: '关闭',
      search: '搜索...',
      export: '导出',
      import: '导入',
      dataOverview: '数据概览',
      brandCount: '品牌数量',
      materialCount: '材料数量',
      showroomCount: '展厅数量',
      categoryCount: '分类数量',
      brandManagement: '品牌库管理',
      addBrand: '添加品牌',
      brandName: '品牌名称',
      mainCategory: '大类',
      subCategory: '子类',
      model: '型号',
      price: '价格',
      supplier: '供应商',
      brand: '品牌',
      category: '分类',
      actions: '操作',
      save: '保存',
      cancel: '取消',
      confirmDelete: '确定删除？',
      deleted: '已删除',
      brandAdded: '品牌添加成功',
      brandUpdated: '品牌更新成功',
      materialManagement: '材料库管理',
      addMaterial: '添加材料',
      materialName: '材料名称',
      type: '类型',
      characteristics: '特性（逗号分隔）',
      minPrice: '最低价',
      maxPrice: '最高价',
      installPriceRange: '安装费区间',
      priceRange: '价格区间',
      installFee: '安装费',
      features: '特性',
      materialAdded: '材料添加成功',
      materialUpdated: '材料更新成功',
      showroomManagement: '展厅管理',
      addShowroom: '添加展厅',
      showroomName: '展厅名称',
      contactPhone: '联系电话',
      address: '地址',
      showroomAdded: '展厅添加成功',
      showroomUpdated: '展厅更新成功',
      dataSettings: '数据设置',
      dataOperations: '数据操作',
      dataOpsDesc: '导出当前所有数据为 JSON 文件，或从文件导入数据。',
      exportData: '导出数据',
      importData: '导入数据',
      dangerousOperation: '危险操作',
      dangerDesc: '重置所有数据为默认值，此操作不可撤销。',
      resetToDefault: '重置为默认数据',
      confirmReset: '确定要重置所有数据为默认值吗？此操作不可撤销。',
      dataReset: '数据已重置',
      exportSuccess: '数据导出成功',
      showFirst20: '显示前 20 条，共',
      records: '条',
    },
    en: {
      title: 'Data Center',
      subtitle: 'Data Management Center',
      overview: 'Overview',
      brandLibrary: 'Brands',
      materialLibrary: 'Materials',
      showroom: 'Showrooms',
      settings: 'Settings',
      close: 'Close',
      search: 'Search...',
      export: 'Export',
      import: 'Import',
      dataOverview: 'Data Overview',
      brandCount: 'Brand Count',
      materialCount: 'Material Count',
      showroomCount: 'Showroom Count',
      categoryCount: 'Category Count',
      brandManagement: 'Brand Management',
      addBrand: 'Add Brand',
      brandName: 'Brand Name',
      mainCategory: 'Main Category',
      subCategory: 'Sub Category',
      model: 'Model',
      price: 'Price',
      supplier: 'Supplier',
      brand: 'Brand',
      category: 'Category',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      confirmDelete: 'Confirm delete?',
      deleted: 'Deleted',
      brandAdded: 'Brand added successfully',
      brandUpdated: 'Brand updated successfully',
      materialManagement: 'Material Management',
      addMaterial: 'Add Material',
      materialName: 'Material Name',
      type: 'Type',
      characteristics: 'Characteristics (comma separated)',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      installPriceRange: 'Install Price Range',
      priceRange: 'Price Range',
      installFee: 'Install Fee',
      features: 'Features',
      materialAdded: 'Material added successfully',
      materialUpdated: 'Material updated successfully',
      showroomManagement: 'Showroom Management',
      addShowroom: 'Add Showroom',
      showroomName: 'Showroom Name',
      contactPhone: 'Contact Phone',
      address: 'Address',
      showroomAdded: 'Showroom added successfully',
      showroomUpdated: 'Showroom updated successfully',
      dataSettings: 'Data Settings',
      dataOperations: 'Data Operations',
      dataOpsDesc: 'Export all data to JSON file, or import from file.',
      exportData: 'Export Data',
      importData: 'Import Data',
      dangerousOperation: 'Dangerous Operation',
      dangerDesc: 'Reset all data to default values. This cannot be undone.',
      resetToDefault: 'Reset to Default',
      confirmReset: 'Are you sure to reset all data to default? This cannot be undone.',
      dataReset: 'Data has been reset',
      exportSuccess: 'Data exported successfully',
      showFirst20: 'Showing first 20 of',
      records: 'records',
    },
    ja: {
      title: 'データセンター',
      subtitle: 'Data Management Center',
      overview: '概要',
      brandLibrary: 'ブランド',
      materialLibrary: '材料',
      showroom: 'ショールーム',
      settings: '設定',
      close: '閉じる',
      search: '検索...',
      export: 'エクスポート',
      import: 'インポート',
      dataOverview: 'データ概要',
      brandCount: 'ブランド数',
      materialCount: '材料数',
      showroomCount: 'ショールーム数',
      categoryCount: 'カテゴリー数',
      brandManagement: 'ブランド管理',
      addBrand: 'ブランド追加',
      brandName: 'ブランド名',
      mainCategory: 'メインカテゴリー',
      subCategory: 'サブカテゴリー',
      model: 'モデル',
      price: '価格',
      supplier: 'サプライヤー',
      brand: 'ブランド',
      category: 'カテゴリー',
      actions: '操作',
      save: '保存',
      cancel: 'キャンセル',
      confirmDelete: '削除しますか？',
      deleted: '削除しました',
      brandAdded: 'ブランドを追加しました',
      brandUpdated: 'ブランドを更新しました',
      materialManagement: '材料管理',
      addMaterial: '材料追加',
      materialName: '材料名',
      type: 'タイプ',
      characteristics: '特性（カンマ区切り）',
      minPrice: '最低価格',
      maxPrice: '最高価格',
      installPriceRange: '設置費範囲',
      priceRange: '価格範囲',
      installFee: '設置費',
      features: '特性',
      materialAdded: '材料を追加しました',
      materialUpdated: '材料を更新しました',
      showroomManagement: 'ショールーム管理',
      addShowroom: 'ショールーム追加',
      showroomName: 'ショールーム名',
      contactPhone: '連絡先',
      address: '住所',
      showroomAdded: 'ショールームを追加しました',
      showroomUpdated: 'ショールームを更新しました',
      dataSettings: 'データ設定',
      dataOperations: 'データ操作',
      dataOpsDesc: 'すべてのデータをJSONファイルにエクスポート、またはファイルからインポート。',
      exportData: 'データエクスポート',
      importData: 'データインポート',
      dangerousOperation: '危険な操作',
      dangerDesc: 'すべてのデータをデフォルト値にリセットします。元に戻せません。',
      resetToDefault: 'デフォルトにリセット',
      confirmReset: 'すべてのデータをデフォルトにリセットしますか？元に戻せません。',
      dataReset: 'データをリセットしました',
      exportSuccess: 'データをエクスポートしました',
      showFirst20: '最初の20件を表示（全',
      records: '件）',
    }
  };
  
  const l = txt[language];

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setBrands(dataStore.getBrands());
      setMaterials(dataStore.getMaterials());
      setShowrooms(dataStore.getShowrooms());
    });
    setBrands(dataStore.getBrands());
    setMaterials(dataStore.getMaterials());
    setShowrooms(dataStore.getShowrooms());
    return unsubscribe;
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const data = dataStore.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archanalyze-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', l.exportSuccess);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = dataStore.importAll(event.target?.result as string);
      showMessage(result.success ? 'success' : 'error', result.message);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm(l.confirmReset)) {
      dataStore.resetToDefault();
      showMessage('success', l.dataReset);
    }
  };

  if (!isOpen) return null;

  const stats = dataStore.getStats();

  const filteredBrands = brands.filter(b => 
    b.name.includes(searchQuery) || b.category.includes(searchQuery) || b.supplier.includes(searchQuery)
  );
  const filteredMaterials = materials.filter(m =>
    m.name.includes(searchQuery) || m.type.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative ml-auto w-full max-w-6xl h-full bg-slate-900 border-l border-slate-800 overflow-hidden flex">
        
        {message && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* Sidebar */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{l.title}</h2>
                <p className="text-xs text-slate-500">{l.subtitle}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'overview' as TabType, icon: BarChart3, label: l.overview },
              { id: 'brands' as TabType, icon: Building2, label: l.brandLibrary, count: stats.brandCount },
              { id: 'materials' as TabType, icon: Package, label: l.materialLibrary, count: stats.materialCount },
              { id: 'showrooms' as TabType, icon: MapPin, label: l.showroom, count: stats.showroomCount },
              { id: 'settings' as TabType, icon: RefreshCw, label: l.settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsAdding(false); setEditingBrand(null); setEditingMaterial(null); setEditingShowroom(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">{item.count}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              {l.close}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={l.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">
                <Download className="w-4 h-4" /> {l.export}
              </button>
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 cursor-pointer">
                <Upload className="w-4 h-4" /> {l.import}
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">{l.dataOverview}</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: l.brandCount, value: stats.brandCount, icon: Building2, color: 'blue' },
                    { label: l.materialCount, value: stats.materialCount, icon: Package, color: 'green' },
                    { label: l.showroomCount, value: stats.showroomCount, icon: MapPin, color: 'amber' },
                    { label: l.categoryCount, value: stats.categoryCount, icon: BarChart3, color: 'purple' },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        <span className="text-sm text-slate-400">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Management */}
            {activeTab === 'brands' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{l.brandManagement}</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingBrand({ id: 0, name: '', category: language === 'zh' ? '地板' : language === 'ja' ? 'フローリング' : 'Flooring', sub_category: language === 'zh' ? '实木地板' : language === 'ja' ? '無垢フローリング' : 'Solid Wood Flooring', material_type: language === 'zh' ? '实木地板' : language === 'ja' ? '無垢フローリング' : 'Solid Wood Flooring', model: '', price: 0, unit: 'm²', supplier: '', rating: 5.0, reviews: 0 }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> {l.addBrand}
                  </button>
                </div>

                {(isAdding || editingBrand) && editingBrand && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">{l.brandName}</label>
                        <input value={editingBrand.name} onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.mainCategory}</label>
                        <select value={editingBrand.category} onChange={e => setEditingBrand({ ...editingBrand, category: e.target.value, sub_category: categoryConfig.subCategories[e.target.value]?.[0] || '' })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1">
                          {categoryConfig.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.subCategory}</label>
                        <select value={editingBrand.sub_category} onChange={e => setEditingBrand({ ...editingBrand, sub_category: e.target.value, material_type: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1">
                          {(categoryConfig.subCategories[editingBrand.category] || []).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.model}</label>
                        <input value={editingBrand.model} onChange={e => setEditingBrand({ ...editingBrand, model: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.price}</label>
                        <input type="number" value={editingBrand.price} onChange={e => setEditingBrand({ ...editingBrand, price: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.supplier}</label>
                        <input value={editingBrand.supplier} onChange={e => setEditingBrand({ ...editingBrand, supplier: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addBrand(editingBrand);
                          showMessage('success', l.brandAdded);
                        } else {
                          dataStore.updateBrand(editingBrand.id, editingBrand);
                          showMessage('success', l.brandUpdated);
                        }
                        setIsAdding(false);
                        setEditingBrand(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> {l.save}
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingBrand(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">{l.cancel}</button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.brand}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.category}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.model}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.price}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.supplier}</th>
                        <th className="px-4 py-3 text-right text-xs text-slate-500 uppercase">{l.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredBrands.slice(0, 20).map(brand => (
                        <tr key={brand.id} className="hover:bg-slate-700/50">
                          <td className="px-4 py-3 font-medium">{brand.name}</td>
                          <td className="px-4 py-3 text-slate-400">{brand.category} / {brand.sub_category}</td>
                          <td className="px-4 py-3 text-slate-400">{brand.model}</td>
                          <td className="px-4 py-3">¥{brand.price}/{brand.unit}</td>
                          <td className="px-4 py-3 text-slate-400">{brand.supplier}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => { setIsAdding(false); setEditingBrand(brand); }} className="p-1 hover:text-blue-400"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => { if (window.confirm(l.confirmDelete)) { dataStore.deleteBrand(brand.id); showMessage('success', l.deleted); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500">{l.showFirst20} {filteredBrands.length} {l.records}</p>
              </div>
            )}

            {/* Material Management */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{l.materialManagement}</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingMaterial({ id: 0, name: '', type: '', characteristics: '', base_price_min: 0, base_price_max: 0, install_price_min: 0, install_price_max: 0 }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> {l.addMaterial}
                  </button>
                </div>

                {(isAdding || editingMaterial) && editingMaterial && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">{l.materialName}</label>
                        <input value={editingMaterial.name} onChange={e => setEditingMaterial({ ...editingMaterial, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.type}</label>
                        <input value={editingMaterial.type} onChange={e => setEditingMaterial({ ...editingMaterial, type: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.characteristics}</label>
                        <input value={editingMaterial.characteristics} onChange={e => setEditingMaterial({ ...editingMaterial, characteristics: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.minPrice}</label>
                        <input type="number" value={editingMaterial.base_price_min} onChange={e => setEditingMaterial({ ...editingMaterial, base_price_min: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.maxPrice}</label>
                        <input type="number" value={editingMaterial.base_price_max} onChange={e => setEditingMaterial({ ...editingMaterial, base_price_max: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.installPriceRange}</label>
                        <div className="flex gap-2 mt-1">
                          <input type="number" value={editingMaterial.install_price_min} onChange={e => setEditingMaterial({ ...editingMaterial, install_price_min: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm" placeholder={language === 'zh' ? '最低' : language === 'ja' ? '最低' : 'Min'} />
                          <input type="number" value={editingMaterial.install_price_max} onChange={e => setEditingMaterial({ ...editingMaterial, install_price_max: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm" placeholder={language === 'zh' ? '最高' : language === 'ja' ? '最高' : 'Max'} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addMaterial(editingMaterial);
                          showMessage('success', l.materialAdded);
                        } else {
                          dataStore.updateMaterial(editingMaterial.id, editingMaterial);
                          showMessage('success', l.materialUpdated);
                        }
                        setIsAdding(false);
                        setEditingMaterial(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> {l.save}
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingMaterial(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">{l.cancel}</button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.materialName}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.type}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.priceRange}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.installFee}</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">{l.features}</th>
                        <th className="px-4 py-3 text-right text-xs text-slate-500 uppercase">{l.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredMaterials.map(material => (
                        <tr key={material.id} className="hover:bg-slate-700/50">
                          <td className="px-4 py-3 font-medium">{material.name}</td>
                          <td className="px-4 py-3 text-slate-400">{material.type}</td>
                          <td className="px-4 py-3">¥{material.base_price_min} - ¥{material.base_price_max}</td>
                          <td className="px-4 py-3">¥{material.install_price_min} - ¥{material.install_price_max}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {material.characteristics.split(',').map((c, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs">{c.trim()}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => { setIsAdding(false); setEditingMaterial(material); }} className="p-1 hover:text-blue-400"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => { if (window.confirm(l.confirmDelete)) { dataStore.deleteMaterial(material.id); showMessage('success', l.deleted); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Showroom Management */}
            {activeTab === 'showrooms' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{l.showroomManagement}</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingShowroom({ id: '', name: '', address: '', lat: 31.2, lng: 121.5, phone: '', distance: '' }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> {l.addShowroom}
                  </button>
                </div>

                {(isAdding || editingShowroom) && editingShowroom && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">{l.showroomName}</label>
                        <input value={editingShowroom.name} onChange={e => setEditingShowroom({ ...editingShowroom, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{l.contactPhone}</label>
                        <input value={editingShowroom.phone} onChange={e => setEditingShowroom({ ...editingShowroom, phone: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-500">{l.address}</label>
                        <input value={editingShowroom.address} onChange={e => setEditingShowroom({ ...editingShowroom, address: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addShowroom(editingShowroom);
                          showMessage('success', l.showroomAdded);
                        } else {
                          dataStore.updateShowroom(editingShowroom.id, editingShowroom);
                          showMessage('success', l.showroomUpdated);
                        }
                        setIsAdding(false);
                        setEditingShowroom(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> {l.save}
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingShowroom(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">{l.cancel}</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {showrooms.map(showroom => (
                    <div key={showroom.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold">{showroom.name}</h4>
                          <p className="text-sm text-slate-400 mt-1">{showroom.address}</p>
                          <p className="text-sm text-slate-500 mt-1">{showroom.phone}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setIsAdding(false); setEditingShowroom(showroom); }} className="p-1 hover:text-blue-400"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => { if (window.confirm(l.confirmDelete)) { dataStore.deleteShowroom(showroom.id); showMessage('success', l.deleted); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">{l.dataSettings}</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold mb-2">{l.dataOperations}</h4>
                    <p className="text-sm text-slate-400 mb-4">{l.dataOpsDesc}</p>
                    <div className="flex gap-2">
                      <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm">
                        <Download className="w-4 h-4" /> {l.exportData}
                      </button>
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-sm cursor-pointer">
                        <Upload className="w-4 h-4" /> {l.importData}
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <h4 className="font-bold text-red-400 mb-2">{l.dangerousOperation}</h4>
                    <p className="text-sm text-slate-400 mb-4">{l.dangerDesc}</p>
                    <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-sm">
                      <RefreshCw className="w-4 h-4" /> {l.resetToDefault}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};