// 数据中台存储层
// 使用 localStorage 持久化，同时提供导入导出功能

import { Brand, Material, Showroom } from '../types';
import { mockBrands, mockShowrooms } from '../data/mockData';

// 默认材料数据
const defaultMaterials: Material[] = [
  { id: 1, name: "实木地板", type: "木地板", characteristics: "耐磨,环保,易清洁,自然纹理", base_price_min: 280, base_price_max: 450, install_price_min: 50, install_price_max: 80 },
  { id: 2, name: "复合地板", type: "木地板", characteristics: "稳定,性价比高,易安装", base_price_min: 150, base_price_max: 280, install_price_min: 40, install_price_max: 60 },
  { id: 3, name: "强化地板", type: "木地板", characteristics: "耐磨,防潮,价格实惠", base_price_min: 80, base_price_max: 150, install_price_min: 30, install_price_max: 50 },
  { id: 4, name: "大理石瓷砖", type: "瓷砖", characteristics: "高档,耐磨,易清洁", base_price_min: 120, base_price_max: 300, install_price_min: 60, install_price_max: 100 },
  { id: 5, name: "抛光砖", type: "瓷砖", characteristics: "光亮,耐磨,价格适中", base_price_min: 60, base_price_max: 120, install_price_min: 40, install_price_max: 70 },
  { id: 6, name: "乳胶漆", type: "涂料", characteristics: "净味,耐擦洗,遮盖力强", base_price_min: 35, base_price_max: 65, install_price_min: 15, install_price_max: 25 },
  { id: 7, name: "艺术漆", type: "涂料", characteristics: "质感丰富,个性定制,高档", base_price_min: 150, base_price_max: 400, install_price_min: 80, install_price_max: 150 },
  { id: 8, name: "布艺沙发", type: "家具", characteristics: "舒适,易拆洗,透气", base_price_min: 3000, base_price_max: 8000, install_price_min: 0, install_price_max: 0 },
  { id: 9, name: "实木沙发", type: "家具", characteristics: "耐用,高档,环保", base_price_min: 8000, base_price_max: 20000, install_price_min: 0, install_price_max: 0 },
  { id: 10, name: "智能马桶", type: "卫浴", characteristics: "智能,舒适,易清洁", base_price_min: 2000, base_price_max: 6000, install_price_min: 100, install_price_max: 200 }
];

// 分类配置
export const categoryConfig = {
  categories: ["瓷砖", "卫浴", "地板", "灯具", "涂料", "五金", "家具", "厨电"],
  subCategories: {
    "地板": ["实木地板", "复合地板", "强化地板", "竹地板"],
    "瓷砖": ["大理石瓷砖", "抛光砖", "仿古砖", "木纹瓷砖"],
    "涂料": ["乳胶漆", "艺术漆", "硅藻泥", "贝壳粉"],
    "卫浴": ["智能马桶", "花洒", "浴缸", "浴室柜"],
    "灯具": ["吊灯", "吸顶灯", "射灯", "灯带"],
    "五金": ["门锁", "合页", "拉手", "水龙头"],
    "家具": ["沙发", "餐桌", "床", "衣柜"],
    "厨电": ["油烟机", "燃气灶", "洗碗机", "蒸烤箱"]
  }
};

// 存储键名
const STORAGE_KEYS = {
  brands: 'archanalyze_brands',
  materials: 'archanalyze_materials',
  showrooms: 'archanalyze_showrooms'
};

// 初始化数据
function initializeData<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  // 首次使用，存入默认数据
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
}

// 数据存储类
class DataStore {
  private brands: Brand[] = [];
  private materials: Material[] = [];
  private showrooms: Showroom[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    // 初始化数据
    this.brands = initializeData(STORAGE_KEYS.brands, mockBrands);
    this.materials = initializeData(STORAGE_KEYS.materials, defaultMaterials);
    this.showrooms = initializeData(STORAGE_KEYS.showrooms, mockShowrooms);
  }

  // 订阅数据变化
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知更新
  private notify() {
    this.listeners.forEach(l => l());
  }

  // 保存到 localStorage
  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }

  // ========== 品牌管理 ==========
  getBrands(): Brand[] {
    return [...this.brands];
  }

  getBrandById(id: number): Brand | undefined {
    return this.brands.find(b => b.id === id);
  }

  addBrand(brand: Omit<Brand, 'id'>): Brand {
    const newBrand: Brand = {
      ...brand,
      id: Math.max(0, ...this.brands.map(b => b.id)) + 1
    };
    this.brands.unshift(newBrand);
    this.save(STORAGE_KEYS.brands, this.brands);
    this.notify();
    return newBrand;
  }

  updateBrand(id: number, updates: Partial<Brand>): boolean {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.brands[index] = { ...this.brands[index], ...updates };
    this.save(STORAGE_KEYS.brands, this.brands);
    this.notify();
    return true;
  }

  deleteBrand(id: number): boolean {
    const index = this.brands.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.brands.splice(index, 1);
    this.save(STORAGE_KEYS.brands, this.brands);
    this.notify();
    return true;
  }

  // ========== 材料管理 ==========
  getMaterials(): Material[] {
    return [...this.materials];
  }

  getMaterialById(id: number): Material | undefined {
    return this.materials.find(m => m.id === id);
  }

  addMaterial(material: Omit<Material, 'id'>): Material {
    const newMaterial: Material = {
      ...material,
      id: Math.max(0, ...this.materials.map(m => m.id)) + 1
    };
    this.materials.unshift(newMaterial);
    this.save(STORAGE_KEYS.materials, this.materials);
    this.notify();
    return newMaterial;
  }

  updateMaterial(id: number, updates: Partial<Material>): boolean {
    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.materials[index] = { ...this.materials[index], ...updates };
    this.save(STORAGE_KEYS.materials, this.materials);
    this.notify();
    return true;
  }

  deleteMaterial(id: number): boolean {
    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.materials.splice(index, 1);
    this.save(STORAGE_KEYS.materials, this.materials);
    this.notify();
    return true;
  }

  // ========== 展厅管理 ==========
  getShowrooms(): Showroom[] {
    return [...this.showrooms];
  }

  addShowroom(showroom: Omit<Showroom, 'id'>): Showroom {
    const newShowroom: Showroom = {
      ...showroom,
      id: `sr-${Date.now()}`
    };
    this.showrooms.push(newShowroom);
    this.save(STORAGE_KEYS.showrooms, this.showrooms);
    this.notify();
    return newShowroom;
  }

  updateShowroom(id: string, updates: Partial<Showroom>): boolean {
    const index = this.showrooms.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.showrooms[index] = { ...this.showrooms[index], ...updates };
    this.save(STORAGE_KEYS.showrooms, this.showrooms);
    this.notify();
    return true;
  }

  deleteShowroom(id: string): boolean {
    const index = this.showrooms.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.showrooms.splice(index, 1);
    this.save(STORAGE_KEYS.showrooms, this.showrooms);
    this.notify();
    return true;
  }

  // ========== 导入导出 ==========
  exportAll(): string {
    return JSON.stringify({
      brands: this.brands,
      materials: this.materials,
      showrooms: this.showrooms,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importAll(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (data.brands) {
        this.brands = data.brands;
        this.save(STORAGE_KEYS.brands, this.brands);
      }
      if (data.materials) {
        this.materials = data.materials;
        this.save(STORAGE_KEYS.materials, this.materials);
      }
      if (data.showrooms) {
        this.showrooms = data.showrooms;
        this.save(STORAGE_KEYS.showrooms, this.showrooms);
      }
      this.notify();
      return { success: true, message: '导入成功' };
    } catch (e) {
      return { success: false, message: '导入失败：JSON 格式错误' };
    }
  }

  // 重置为默认数据
  resetToDefault(): void {
    this.brands = [...mockBrands];
    this.materials = [...defaultMaterials];
    this.showrooms = [...mockShowrooms];
    this.save(STORAGE_KEYS.brands, this.brands);
    this.save(STORAGE_KEYS.materials, this.materials);
    this.save(STORAGE_KEYS.showrooms, this.showrooms);
    this.notify();
  }

  // 统计信息
  getStats() {
    return {
      brandCount: this.brands.length,
      materialCount: this.materials.length,
      showroomCount: this.showrooms.length,
      categoryCount: categoryConfig.categories.length
    };
  }
}

// 单例模式
export const dataStore = new DataStore();