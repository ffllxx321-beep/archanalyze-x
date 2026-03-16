import React, { useState, useMemo } from 'react';
import { Search, Star, Building2, MessageSquare, Box, Filter, ChevronRight, AlertCircle, ArrowUpDown, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { Brand } from '../types';
import { mockBrands } from '../data/mockData';
import { locales, Language, getLocale } from '../locales';

interface BrandLibraryProps {
  brands: Brand[];
  onSelectBrand?: (brand: Brand) => void;
  maxHeight?: string;
  initialCategory?: string | null;
  broadCategory?: string | null;
  language?: Language;
}

export const BrandLibrary: React.FC<BrandLibraryProps> = ({ 
  brands, 
  onSelectBrand, 
  maxHeight, 
  initialCategory,
  broadCategory,
  language = 'zh'
}) => {
  const t = getLocale(language);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'rating' | 'price' | 'none'>('none');

  // Sync with initialCategory
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory(null);
    }
  }, [initialCategory]);

  const categories = useMemo(() => {
    const cats = new Set(brands.map(b => b.sub_category));
    return Array.from(cats);
  }, [brands]);

  const fuse = useMemo(() => {
    return new Fuse(brands, {
      keys: ['name', 'category', 'sub_category', 'supplier', 'model'],
      threshold: 0.3,
    });
  }, [brands]);

  // Fuzzy matching function for material types
  const isMaterialMatch = (brandSubCategory: string, selectedCat: string): boolean => {
    const brand = brandSubCategory.toLowerCase();
    const selected = selectedCat.toLowerCase();
    
    // Exact match
    if (brand === selected) return true;
    
    // Fuzzy match: check if one contains the other
    if (brand.includes(selected) || selected.includes(brand)) return true;
    
    // Match on keywords (multi-language support)
    const keywords = language === 'zh' 
      ? ['地板', '瓷砖', '卫浴', '涂料', '灯具', '五金', '家具', '厨电', '门', '窗']
      : language === 'ja'
      ? ['フローリング', 'タイル', 'バスルーム', '塗料', '照明', '金物', '家具', 'キッチン家電', 'ドア', '窓']
      : ['flooring', 'tile', 'bathroom', 'paint', 'lighting', 'hardware', 'furniture', 'kitchen', 'door', 'window'];
    
    for (const kw of keywords) {
      if (brand.includes(kw) && selected.includes(kw)) return true;
    }
    
    // Common material type mappings
    const mappings: Record<string, string[]> = language === 'zh' ? {
      '地板': ['实木地板', '复合地板', '强化地板', '竹地板', '木地板', '地砖'],
      '瓷砖': ['大理石瓷砖', '抛光砖', '仿古砖', '木纹瓷砖', '墙砖'],
      '涂料': ['乳胶漆', '艺术漆', '硅藻泥', '贝壳粉', '油漆'],
      '卫浴': ['智能马桶', '花洒', '浴缸', '浴室柜', '马桶', '水龙头'],
      '灯具': ['吊灯', '吸顶灯', '射灯', '灯带', '筒灯'],
      '家具': ['沙发', '餐桌', '床', '衣柜', '书柜', '茶几', '鞋柜'],
      '门窗': ['防盗门', '卧室门', '卫生间门', '推拉门', '窗户', '铝合金窗']
    } : {};
    
    for (const [mainCat, subCats] of Object.entries(mappings)) {
      const brandMatch = subCats.some(s => brand.includes(s)) || subCats.some(s => brand === s);
      const selectedMatch = subCats.some(s => selected.includes(s)) || subCats.some(s => selected === s);
      if (brandMatch && selectedMatch) return true;
    }
    
    return false;
  };

  const filteredBrands = useMemo(() => {
    let results = searchQuery 
      ? fuse.search(searchQuery).map(r => r.item)
      : brands;

    if (selectedCategory && !searchQuery) {
      results = results.filter(b => isMaterialMatch(b.sub_category, selectedCategory));
    }

    if (sortOrder === 'rating') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'price') {
      results = [...results].sort((a, b) => a.price - b.price);
    }

    return results;
  }, [searchQuery, selectedCategory, sortOrder, fuse, brands]);

  const fallbackBrands = useMemo(() => {
    if (filteredBrands.length > 0 || !broadCategory || searchQuery) return [];
    
    let results = brands.filter(b => 
      b.category === broadCategory || b.sub_category.includes(broadCategory)
    );

    if (results.length === 0) {
      const broadFuse = new Fuse(brands, { keys: ['category', 'sub_category'], threshold: 0.4 });
      results = broadFuse.search(broadCategory).map(r => r.item);
    }

    if (sortOrder === 'rating') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'price') {
      results = [...results].sort((a, b) => a.price - b.price);
    }

    return results;
  }, [filteredBrands, broadCategory, brands, searchQuery, sortOrder]);

  const isShowingFallback = !searchQuery && filteredBrands.length === 0 && fallbackBrands.length > 0 && selectedCategory === initialCategory;

  // Translations for BrandLibrary
  const brandLibText = {
    zh: {
      title: '品牌库推荐',
      totalSuppliers: '共收录',
      certifiedSuppliers: '个认证供应商',
      sortByRating: '按评分排序',
      sortByPrice: '按价格排序',
      defaultSort: '默认排序',
      rating: '评分',
      price: '价格',
      reset: '重置',
      resetAllFilters: '重置所有过滤器',
      searchPlaceholder: '搜索品牌、材料类型或供应商...',
      all: '全部',
      notFound: '尚未收录',
      relatedBrands: '相关品牌',
      suggestAdd: '建议手动添加该品类品牌，或查看下方相近品类品牌。',
      recommendForYou: '为您推荐',
      related: '相关',
      model: '型号：',
      estimatedUnitPrice: '预估单价：',
      supplier: '供应商：',
      viewDetails: '查看详情',
      noMatchFound: '未找到匹配的品牌',
      tryOtherSearch: '请尝试其他搜索条件',
      currentCategory: '当前分类',
      noBrandsInCategory: '暂无收录品牌',
      canAddManually: '您可以手动添加新品牌到品牌库',
      viewAllBrands: '查看全部品牌',
      requestSample: '申请实物小样',
      freeDelivery: '免费配送至您的工作室'
    },
    en: {
      title: 'Brand Recommendations',
      totalSuppliers: 'Total',
      certifiedSuppliers: 'certified suppliers',
      sortByRating: 'Sort by rating',
      sortByPrice: 'Sort by price',
      defaultSort: 'Default sort',
      rating: 'Rating',
      price: 'Price',
      reset: 'Reset',
      resetAllFilters: 'Reset all filters',
      searchPlaceholder: 'Search brands, materials or suppliers...',
      all: 'All',
      notFound: 'No brands found for',
      relatedBrands: 'related brands',
      suggestAdd: 'Suggest adding brands for this category manually, or check similar brands below.',
      recommendForYou: 'Recommendations for',
      related: 'related',
      model: 'Model:',
      estimatedUnitPrice: 'Est. Price:',
      supplier: 'Supplier:',
      viewDetails: 'View Details',
      noMatchFound: 'No matching brands found',
      tryOtherSearch: 'Try different search criteria',
      currentCategory: 'Current category',
      noBrandsInCategory: 'has no brands yet',
      canAddManually: 'You can manually add new brands to the library',
      viewAllBrands: 'View all brands',
      requestSample: 'Request Sample',
      freeDelivery: 'Free delivery to your studio'
    },
    ja: {
      title: 'ブランド推奨',
      totalSuppliers: '合計',
      certifiedSuppliers: '認定サプライヤー',
      sortByRating: '評価順でソート',
      sortByPrice: '価格順でソート',
      defaultSort: 'デフォルト順',
      rating: '評価',
      price: '価格',
      reset: 'リセット',
      resetAllFilters: 'すべてのフィルターをリセット',
      searchPlaceholder: 'ブランド、材料、サプライヤーを検索...',
      all: 'すべて',
      notFound: 'ブランドが見つかりません',
      relatedBrands: '関連ブランド',
      suggestAdd: 'このカテゴリーのブランドを手動で追加するか、下の類似ブランドをご確認ください。',
      recommendForYou: 'おすすめ',
      related: '関連',
      model: 'モデル：',
      estimatedUnitPrice: '推定単価：',
      supplier: 'サプライヤー：',
      viewDetails: '詳細を見る',
      noMatchFound: '一致するブランドが見つかりません',
      tryOtherSearch: '別の検索条件をお試しください',
      currentCategory: '現在のカテゴリー',
      noBrandsInCategory: 'にブランドがありません',
      canAddManually: '新しいブランドをライブラリに追加できます',
      viewAllBrands: 'すべてのブランドを表示',
      requestSample: 'サンプル請求',
      freeDelivery: 'スタジオまで無料配送'
    }
  };
  
  const txt = brandLibText[language];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header & Search */}
      <div className="p-6 border-b border-slate-800 bg-slate-800/30 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{txt.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{txt.totalSuppliers} {brands.length} {txt.certifiedSuppliers}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (sortOrder === 'none') setSortOrder('rating');
                else if (sortOrder === 'rating') setSortOrder('price');
                else setSortOrder('none');
              }}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${sortOrder !== 'none' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              title={sortOrder === 'rating' ? txt.sortByRating : sortOrder === 'price' ? txt.sortByPrice : txt.defaultSort}
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder !== 'none' && <span className="text-[10px] font-bold">{sortOrder === 'rating' ? txt.rating : txt.price}</span>}
            </button>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSortOrder('none');
              }}
              className="px-3 py-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              title={txt.resetAllFilters}
            >
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-bold">{txt.reset}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={txt.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Categories Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${!selectedCategory ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
          >
            {txt.all}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand List */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        style={{ maxHeight: maxHeight || 'none' }}
      >
        {isShowingFallback && (
          <div className="p-4 rounded-xl bg-amber-600/10 border border-amber-500/30 mb-6">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-xs font-bold">{txt.notFound} "{selectedCategory}" {txt.relatedBrands}</p>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">{txt.suggestAdd}</p>
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold">
              <span>{txt.recommendForYou} {broadCategory} {txt.related} {txt.relatedBrands}</span>
              <div className="h-[1px] flex-1 bg-blue-500/20" />
            </div>
          </div>
        )}

        {(filteredBrands.length > 0 || isShowingFallback) ? (
          (isShowingFallback ? fallbackBrands : filteredBrands).map(brand => (
            <div 
              key={brand.id} 
              className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-blue-500/30 transition-all group cursor-pointer"
              onClick={() => onSelectBrand?.(brand)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{brand.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500">{brand.rating} ({brand.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">{brand.category}</span>
                  <span className="text-xs font-bold text-blue-400">{brand.sub_category}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{txt.model}</span>
                  <span className="font-medium text-slate-300">{brand.model}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{txt.estimatedUnitPrice}</span>
                  <span className="font-bold text-white">¥{brand.price}/{brand.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{txt.supplier}</span>
                  <span className="font-medium text-blue-400 truncate max-w-[150px]">{brand.supplier}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-slate-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-700 transition-colors">{txt.viewDetails}</button>
                <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">{txt.noMatchFound}</p>
            <p className="text-xs text-slate-400 mb-4">
              {broadCategory ? `${txt.currentCategory} "${selectedCategory || broadCategory}" ${txt.noBrandsInCategory}` : txt.tryOtherSearch}
            </p>
            <p className="text-xs text-blue-400 mb-2">{txt.canAddManually}</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="mt-2 text-blue-500 text-xs font-bold hover:underline"
            >
              {txt.viewAllBrands}
            </button>
          </div>
        )}
      </div>

      {/* Footer / Showroom Link */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/30 transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">{txt.requestSample}</p>
            <p className="text-[10px] text-slate-500">{txt.freeDelivery}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 ml-auto" />
        </div>
      </div>
    </div>
  );
};