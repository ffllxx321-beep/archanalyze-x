import React, { useState, useEffect } from 'react';
import { 
  Database, X, Plus, Edit3, Trash2, Save, Download, Upload, 
  Building2, Package, MapPin, RefreshCw, Search, ChevronRight,
  AlertCircle, CheckCircle2, BarChart3
} from 'lucide-react';
import { Brand, Material, Showroom } from '../types';
import { dataStore, categoryConfig } from '../store/dataStore';

interface DataCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'brands' | 'materials' | 'showrooms' | 'settings';

export const DataCenter: React.FC<DataCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 编辑状态
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // 消息提示
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 订阅数据变化
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

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 导出数据
  const handleExport = () => {
    const data = dataStore.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archanalyze-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', '数据导出成功');
  };

  // 导入数据
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

  // 重置数据
  const handleReset = () => {
    if (window.confirm('确定要重置所有数据为默认值吗？此操作不可撤销。')) {
      dataStore.resetToDefault();
      showMessage('success', '数据已重置');
    }
  };

  if (!isOpen) return null;

  const stats = dataStore.getStats();

  // 过滤搜索结果
  const filteredBrands = brands.filter(b => 
    b.name.includes(searchQuery) || b.category.includes(searchQuery) || b.supplier.includes(searchQuery)
  );
  const filteredMaterials = materials.filter(m =>
    m.name.includes(searchQuery) || m.type.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* 主面板 */}
      <div className="relative ml-auto w-full max-w-6xl h-full bg-slate-900 border-l border-slate-800 overflow-hidden flex">
        
        {/* 消息提示 */}
        {message && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        {/* 侧边栏 */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">数据中台</h2>
                <p className="text-xs text-slate-500">Data Management Center</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'overview' as TabType, icon: BarChart3, label: '概览' },
              { id: 'brands' as TabType, icon: Building2, label: '品牌库', count: stats.brandCount },
              { id: 'materials' as TabType, icon: Package, label: '材料库', count: stats.materialCount },
              { id: 'showrooms' as TabType, icon: MapPin, label: '展厅', count: stats.showroomCount },
              { id: 'settings' as TabType, icon: RefreshCw, label: '设置' },
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
              关闭
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部搜索栏 */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">
                <Download className="w-4 h-4" /> 导出
              </button>
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 cursor-pointer">
                <Upload className="w-4 h-4" /> 导入
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-auto p-6">
            {/* 概览 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">数据概览</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: '品牌数量', value: stats.brandCount, icon: Building2, color: 'blue' },
                    { label: '材料数量', value: stats.materialCount, icon: Package, color: 'green' },
                    { label: '展厅数量', value: stats.showroomCount, icon: MapPin, color: 'amber' },
                    { label: '分类数量', value: stats.categoryCount, icon: BarChart3, color: 'purple' },
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

            {/* 品牌管理 */}
            {activeTab === 'brands' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">品牌库管理</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingBrand({ id: 0, name: '', category: '地板', sub_category: '实木地板', material_type: '实木地板', model: '', price: 0, unit: 'm²', supplier: '', rating: 5.0, reviews: 0 }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> 添加品牌
                  </button>
                </div>

                {/* 编辑表单 */}
                {(isAdding || editingBrand) && editingBrand && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">品牌名称</label>
                        <input value={editingBrand.name} onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">大类</label>
                        <select value={editingBrand.category} onChange={e => setEditingBrand({ ...editingBrand, category: e.target.value, sub_category: categoryConfig.subCategories[e.target.value]?.[0] || '' })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1">
                          {categoryConfig.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">子类</label>
                        <select value={editingBrand.sub_category} onChange={e => setEditingBrand({ ...editingBrand, sub_category: e.target.value, material_type: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1">
                          {(categoryConfig.subCategories[editingBrand.category] || []).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">型号</label>
                        <input value={editingBrand.model} onChange={e => setEditingBrand({ ...editingBrand, model: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">价格</label>
                        <input type="number" value={editingBrand.price} onChange={e => setEditingBrand({ ...editingBrand, price: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">供应商</label>
                        <input value={editingBrand.supplier} onChange={e => setEditingBrand({ ...editingBrand, supplier: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addBrand(editingBrand);
                          showMessage('success', '品牌添加成功');
                        } else {
                          dataStore.updateBrand(editingBrand.id, editingBrand);
                          showMessage('success', '品牌更新成功');
                        }
                        setIsAdding(false);
                        setEditingBrand(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> 保存
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingBrand(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">取消</button>
                    </div>
                  </div>
                )}

                {/* 列表 */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">品牌</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">分类</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">型号</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">价格</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">供应商</th>
                        <th className="px-4 py-3 text-right text-xs text-slate-500 uppercase">操作</th>
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
                            <button onClick={() => { if (window.confirm('确定删除？')) { dataStore.deleteBrand(brand.id); showMessage('success', '已删除'); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500">显示前 20 条，共 {filteredBrands.length} 条</p>
              </div>
            )}

            {/* 材料管理 */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">材料库管理</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingMaterial({ id: 0, name: '', type: '', characteristics: '', base_price_min: 0, base_price_max: 0, install_price_min: 0, install_price_max: 0 }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> 添加材料
                  </button>
                </div>

                {/* 编辑表单 */}
                {(isAdding || editingMaterial) && editingMaterial && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">材料名称</label>
                        <input value={editingMaterial.name} onChange={e => setEditingMaterial({ ...editingMaterial, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">类型</label>
                        <input value={editingMaterial.type} onChange={e => setEditingMaterial({ ...editingMaterial, type: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">特性（逗号分隔）</label>
                        <input value={editingMaterial.characteristics} onChange={e => setEditingMaterial({ ...editingMaterial, characteristics: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">最低价</label>
                        <input type="number" value={editingMaterial.base_price_min} onChange={e => setEditingMaterial({ ...editingMaterial, base_price_min: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">最高价</label>
                        <input type="number" value={editingMaterial.base_price_max} onChange={e => setEditingMaterial({ ...editingMaterial, base_price_max: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">安装费区间</label>
                        <div className="flex gap-2 mt-1">
                          <input type="number" value={editingMaterial.install_price_min} onChange={e => setEditingMaterial({ ...editingMaterial, install_price_min: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm" placeholder="最低" />
                          <input type="number" value={editingMaterial.install_price_max} onChange={e => setEditingMaterial({ ...editingMaterial, install_price_max: Number(e.target.value) })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm" placeholder="最高" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addMaterial(editingMaterial);
                          showMessage('success', '材料添加成功');
                        } else {
                          dataStore.updateMaterial(editingMaterial.id, editingMaterial);
                          showMessage('success', '材料更新成功');
                        }
                        setIsAdding(false);
                        setEditingMaterial(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> 保存
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingMaterial(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">取消</button>
                    </div>
                  </div>
                )}

                {/* 列表 */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">名称</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">类型</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">价格区间</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">安装费</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">特性</th>
                        <th className="px-4 py-3 text-right text-xs text-slate-500 uppercase">操作</th>
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
                            <button onClick={() => { if (window.confirm('确定删除？')) { dataStore.deleteMaterial(material.id); showMessage('success', '已删除'); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 展厅管理 */}
            {activeTab === 'showrooms' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">展厅管理</h3>
                  <button
                    onClick={() => { setIsAdding(true); setEditingShowroom({ id: '', name: '', address: '', lat: 31.2, lng: 121.5, phone: '', distance: '' }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> 添加展厅
                  </button>
                </div>

                {/* 编辑表单 */}
                {(isAdding || editingShowroom) && editingShowroom && (
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500">展厅名称</label>
                        <input value={editingShowroom.name} onChange={e => setEditingShowroom({ ...editingShowroom, name: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">联系电话</label>
                        <input value={editingShowroom.phone} onChange={e => setEditingShowroom({ ...editingShowroom, phone: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-500">地址</label>
                        <input value={editingShowroom.address} onChange={e => setEditingShowroom({ ...editingShowroom, address: e.target.value })} className="w-full bg-slate-700 rounded px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (isAdding) {
                          dataStore.addShowroom(editingShowroom);
                          showMessage('success', '展厅添加成功');
                        } else {
                          dataStore.updateShowroom(editingShowroom.id, editingShowroom);
                          showMessage('success', '展厅更新成功');
                        }
                        setIsAdding(false);
                        setEditingShowroom(null);
                      }} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm">
                        <Save className="w-4 h-4" /> 保存
                      </button>
                      <button onClick={() => { setIsAdding(false); setEditingShowroom(null); }} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">取消</button>
                    </div>
                  </div>
                )}

                {/* 列表 */}
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
                          <button onClick={() => { if (window.confirm('确定删除？')) { dataStore.deleteShowroom(showroom.id); showMessage('success', '已删除'); } }} className="p-1 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 设置 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">数据设置</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <h4 className="font-bold mb-2">数据操作</h4>
                    <p className="text-sm text-slate-400 mb-4">导出当前所有数据为 JSON 文件，或从文件导入数据。</p>
                    <div className="flex gap-2">
                      <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm">
                        <Download className="w-4 h-4" /> 导出数据
                      </button>
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-sm cursor-pointer">
                        <Upload className="w-4 h-4" /> 导入数据
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                    <h4 className="font-bold text-red-400 mb-2">危险操作</h4>
                    <p className="text-sm text-slate-400 mb-4">重置所有数据为默认值，此操作不可撤销。</p>
                    <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-sm">
                      <RefreshCw className="w-4 h-4" /> 重置为默认数据
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