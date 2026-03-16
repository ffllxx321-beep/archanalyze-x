// 多语言配置 - Internationalization

export type Language = 'zh' | 'en' | 'ja';

export const locales = {
  zh: {
    // Header
    appTitle: 'ArchAnalyze AI 智筑分析',
    appSubtitle: 'Professional Budget Suite',
    dashboard: '仪表盘',
    analysisDetail: '分析详情',
    budgetReport: '概算报表',
    
    // Settings Dropdown
    newProject: '新建项目',
    brandDatabase: '品牌数据库',
    settings: '设置',
    dataCenter: '数据中台',
    
    // Dashboard
    projectDashboard: '项目仪表盘',
    dashboardDesc: '上传您的建筑渲染图或草图，AI 将为您生成即时预算分析。',
    history: '历史记录',
    uploadRender: '上传渲染图 / 草图',
    supportedFormats: '支持 JPEG, PNG, PDF 格式',
    selectFile: '选择文件',
    changeImage: '更换图片',
    startAnalysis: '开始 AI 概算分析',
    analyzing: 'AI 正在深度分析中...',
    
    // Recent Analysis
    recentAnalysis: '最近分析',
    modernLivingRoom: '现代简约客厅方案',
    
    // Pro Features
    proFeatures: '专业版功能',
    proFeaturesDesc: '解锁 Revit 深度集成与多方案对比功能。',
    upgradeNow: '立即升级',
    
    // Analysis View
    aiConfidence: 'AI 置信度',
    accuracy: '准确',
    identifiedItems: '识别项目',
    materials: '项材料',
    changeMaterial: '变更材质',
    generateReport: '生成报表',
    regenerating: '正在根据您的要求重新生成效果图...',
    
    // Material Details
    category: '类别',
    estimatedPrice: '预估单价',
    installCost: '安装成本',
    ecoLevel: '环保等级',
    maintenanceCycle: '维护周期',
    years: '年',
    materialFeatures: '材料特性',
    noPriceInfo: '暂未获取到该材料的详细价格信息',
    clickHotspot: '点击图片上的热点查看详细材料分析',
    
    // Showroom
    nearbyShowrooms: '附近展厅',
    viewAllShowrooms: '查看全部',
    showrooms: '个展厅',
    
    // Report View
    budgetSummary: '概算造价汇总',
    budgetSummaryDesc: '基于 AI 分析与品牌库数据的动态预算报表。',
    importRevit: '导入 Revit 明细表',
    exportPDF: '导出 PDF 报表',
    quantityList: '工程量清单',
    totalMaterials: '共',
    materialName: '材料名称',
    quantity: '工程量',
    unit: '单位',
    unitPrice: '预估单价',
    totalPrice: '合价',
    totalBudget: '总计概算造价',
    
    // Cost Analysis
    costAnalysis: '成本构成分析',
    budgetHealth: '预算健康度',
    budgetInRange: '预算在合理区间内',
    budgetInRangeDesc: '当前造价符合同类项目平均水平。',
    
    // Change Material Modal
    changeMaterialTitle: '变更材质要求',
    changeMaterialDesc: '告诉 AI 您想如何修改当前的装饰方案，我们将为您生成新的效果图并更新预算。',
    changeMaterialPlaceholder: '例如：将地板更换为深色胡桃木，墙面增加大理石背景墙...',
    cancel: '取消',
    regenerate: '重新生成',
    
    // Brand Database Modal
    brandDbTitle: '品牌数据库管理',
    addBrand: '新增品牌信息',
    brandName: '品牌名称',
    brandNamePlaceholder: '例如：泰拉木业',
    mainCategory: '大类类别',
    subCategory: '具体品类',
    subCategoryPlaceholder: '例如：木纹瓷砖',
    modelSpec: '型号规格',
    modelSpecPlaceholder: '例如：北欧橡木 XL',
    price: '单价',
    supplierName: '供应商名称',
    saveBrand: '保存品牌',
    importData: '导入数据',
    close: '关闭',
    newBrand: '新建品牌',
    
    // Settings Modal
    settingsTitle: '软件设置',
    generalSettings: '常规设置',
    defaultCurrency: '默认货币',
    currencyUnit: '报表显示的货币单位',
    measurementUnit: '计量单位',
    measurementUnitDesc: '工程量默认单位',
    squareMeter: '平方米',
    cubicMeter: '立方米',
    meter: '米',
    aiModelSettings: 'AI 模型设定',
    visionModel: '视觉模型',
    imageModel: '图像生成模型',
    apiKey: 'API Key',
    apiKeyPlaceholder: '输入您的 sk-...',
    apiKeyDesc: '留空则使用系统默认配置',
    currentVersion: '当前版本',
    saveSettings: '保存设置',
    
    // Language
    language: '语言',
    languageDesc: '应用界面语言',
    chinese: '中文',
    english: 'English',
    japanese: '日本語',
    
    // Footer
    currentBudget: '当前概算总额',
    identifiedMaterials: '识别材料项',
    viewFullReport: '查看完整报表',
    saveProject: '保存项目',
    
    // Progress
    preparingData: '正在准备图片数据...',
    identifyingSpace: 'AI 正在识别空间结构与材料...',
    generatingReport: '正在生成概算报告...',
    submittingTask: '正在提交生成任务...',
    thinkingLayout: 'AI 正在构思空间布局...',
    renderingDetails: '正在渲染材质细节...',
    postProcessing: '正在进行后期光影优化...',
    applyingEffect: '正在应用新效果图...',
    
    // Analysis Progress
    spaceIdentification: '空间识别',
    materialAnalysis: '材质分析',
    reportGeneration: '报告生成',
    aiAnalyzing: 'AI 正在深度分析中',
    aiGeneratingImage: 'AI 正在生成效果图',
    
    // Alerts
    confirmNewProject: '是否创建新项目？当前未保存的更改将会丢失。',
    fillBrandInfo: '请填写完整品牌信息',
    analysisFailed: '分析失败',
    imageGenFailed: '图像生成失败',
    unknownError: '未知错误',
    
    // Categories
    flooring: '地板',
    tile: '瓷砖',
    paint: '涂料',
    bathroom: '卫浴',
    lighting: '灯具',
    hardware: '五金',
    furniture: '家具',
    kitchenAppliance: '厨电',
    other: '其它',
    
    // Material types
    solidWoodFlooring: '实木地板',
    woodGrainTile: '木纹瓷砖',
    
    // Recommended
    recommended: '推荐',
  },
  
  en: {
    // Header
    appTitle: 'ArchAnalyze AI',
    appSubtitle: 'Professional Budget Suite',
    dashboard: 'Dashboard',
    analysisDetail: 'Analysis',
    budgetReport: 'Budget Report',
    
    // Settings Dropdown
    newProject: 'New Project',
    brandDatabase: 'Brand Database',
    settings: 'Settings',
    dataCenter: 'Data Center',
    
    // Dashboard
    projectDashboard: 'Project Dashboard',
    dashboardDesc: 'Upload your architectural renderings or sketches, AI will generate instant budget analysis.',
    history: 'History',
    uploadRender: 'Upload Rendering / Sketch',
    supportedFormats: 'Supports JPEG, PNG, PDF formats',
    selectFile: 'Select File',
    changeImage: 'Change Image',
    startAnalysis: 'Start AI Budget Analysis',
    analyzing: 'AI is analyzing...',
    
    // Recent Analysis
    recentAnalysis: 'Recent Analysis',
    modernLivingRoom: 'Modern Minimalist Living Room',
    
    // Pro Features
    proFeatures: 'Pro Features',
    proFeaturesDesc: 'Unlock Revit integration and multi-scheme comparison.',
    upgradeNow: 'Upgrade Now',
    
    // Analysis View
    aiConfidence: 'AI Confidence',
    accuracy: 'Accurate',
    identifiedItems: 'Identified Items',
    materials: 'materials',
    changeMaterial: 'Change Material',
    generateReport: 'Generate Report',
    regenerating: 'Regenerating rendering based on your requirements...',
    
    // Material Details
    category: 'Category',
    estimatedPrice: 'Estimated Price',
    installCost: 'Installation Cost',
    ecoLevel: 'Eco Level',
    maintenanceCycle: 'Maintenance Cycle',
    years: 'years',
    materialFeatures: 'Material Features',
    noPriceInfo: 'Price information not available for this material',
    clickHotspot: 'Click hotspots on the image to view detailed material analysis',
    
    // Showroom
    nearbyShowrooms: 'Nearby Showrooms',
    viewAllShowrooms: 'View All',
    showrooms: 'showrooms',
    
    // Report View
    budgetSummary: 'Budget Summary',
    budgetSummaryDesc: 'Dynamic budget report based on AI analysis and brand database.',
    importRevit: 'Import Revit Schedule',
    exportPDF: 'Export PDF Report',
    quantityList: 'Quantity Takeoff',
    totalMaterials: 'Total',
    materialName: 'Material Name',
    quantity: 'Quantity',
    unit: 'Unit',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',
    totalBudget: 'Total Budget',
    
    // Cost Analysis
    costAnalysis: 'Cost Breakdown',
    budgetHealth: 'Budget Health',
    budgetInRange: 'Budget is within reasonable range',
    budgetInRangeDesc: 'Current cost aligns with similar projects.',
    
    // Change Material Modal
    changeMaterialTitle: 'Material Change Request',
    changeMaterialDesc: 'Tell AI how you want to modify the current decoration scheme, we will generate new renderings and update the budget.',
    changeMaterialPlaceholder: 'e.g., Replace flooring with dark walnut, add marble feature wall...',
    cancel: 'Cancel',
    regenerate: 'Regenerate',
    
    // Brand Database Modal
    brandDbTitle: 'Brand Database Management',
    addBrand: 'Add Brand Information',
    brandName: 'Brand Name',
    brandNamePlaceholder: 'e.g., TARA Wood',
    mainCategory: 'Main Category',
    subCategory: 'Sub Category',
    subCategoryPlaceholder: 'e.g., Wood Grain Tile',
    modelSpec: 'Model/Spec',
    modelSpecPlaceholder: 'e.g., Nordic Oak XL',
    price: 'Price',
    supplierName: 'Supplier Name',
    saveBrand: 'Save Brand',
    importData: 'Import Data',
    close: 'Close',
    newBrand: 'New Brand',
    
    // Settings Modal
    settingsTitle: 'Settings',
    generalSettings: 'General Settings',
    defaultCurrency: 'Default Currency',
    currencyUnit: 'Currency unit for reports',
    measurementUnit: 'Measurement Unit',
    measurementUnitDesc: 'Default unit for quantities',
    squareMeter: 'Square Meter',
    cubicMeter: 'Cubic Meter',
    meter: 'Meter',
    aiModelSettings: 'AI Model Settings',
    visionModel: 'Vision Model',
    imageModel: 'Image Model',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your sk-...',
    apiKeyDesc: 'Leave empty to use system default',
    currentVersion: 'Current Version',
    saveSettings: 'Save Settings',
    
    // Language
    language: 'Language',
    languageDesc: 'Application interface language',
    chinese: '中文',
    english: 'English',
    japanese: '日本語',
    
    // Footer
    currentBudget: 'Current Budget Total',
    identifiedMaterials: 'Identified Materials',
    viewFullReport: 'View Full Report',
    saveProject: 'Save Project',
    
    // Progress
    preparingData: 'Preparing image data...',
    identifyingSpace: 'AI is identifying space structure and materials...',
    generatingReport: 'Generating budget report...',
    submittingTask: 'Submitting generation task...',
    thinkingLayout: 'AI is planning space layout...',
    renderingDetails: 'Rendering material details...',
    postProcessing: 'Post-processing lighting and shadows...',
    applyingEffect: 'Applying new rendering...',
    
    // Analysis Progress
    spaceIdentification: 'Space ID',
    materialAnalysis: 'Material Analysis',
    reportGeneration: 'Report Gen',
    aiAnalyzing: 'AI is analyzing',
    aiGeneratingImage: 'AI is generating image',
    
    // Alerts
    confirmNewProject: 'Create new project? Unsaved changes will be lost.',
    fillBrandInfo: 'Please fill in complete brand information',
    analysisFailed: 'Analysis failed',
    imageGenFailed: 'Image generation failed',
    unknownError: 'Unknown error',
    
    // Categories
    flooring: 'Flooring',
    tile: 'Tile',
    paint: 'Paint',
    bathroom: 'Bathroom',
    lighting: 'Lighting',
    hardware: 'Hardware',
    furniture: 'Furniture',
    kitchenAppliance: 'Kitchen Appliance',
    other: 'Other',
    
    // Material types
    solidWoodFlooring: 'Solid Wood Flooring',
    woodGrainTile: 'Wood Grain Tile',
    
    // Recommended
    recommended: 'Recommended',
  },
  
  ja: {
    // Header
    appTitle: 'ArchAnalyze AI',
    appSubtitle: 'Professional Budget Suite',
    dashboard: 'ダッシュボード',
    analysisDetail: '分析詳細',
    budgetReport: '概算レポート',
    
    // Settings Dropdown
    newProject: '新規プロジェクト',
    brandDatabase: 'ブランドデータベース',
    settings: '設定',
    dataCenter: 'データセンター',
    
    // Dashboard
    projectDashboard: 'プロジェクトダッシュボード',
    dashboardDesc: '建築レンダリングやスケッチをアップロードすると、AIが即座に予算分析を生成します。',
    history: '履歴',
    uploadRender: 'レンダリング / スケッチをアップロード',
    supportedFormats: 'JPEG, PNG, PDF形式に対応',
    selectFile: 'ファイルを選択',
    changeImage: '画像を変更',
    startAnalysis: 'AI概算分析を開始',
    analyzing: 'AIが分析中...',
    
    // Recent Analysis
    recentAnalysis: '最近の分析',
    modernLivingRoom: 'モダンミニマルリビング',
    
    // Pro Features
    proFeatures: 'プロ機能',
    proFeaturesDesc: 'Revit連携とマルチプラン比較をアンロック。',
    upgradeNow: '今すぐアップグレード',
    
    // Analysis View
    aiConfidence: 'AI信頼度',
    accuracy: '正確',
    identifiedItems: '識別項目',
    materials: '項目の材料',
    changeMaterial: '材料変更',
    generateReport: 'レポート生成',
    regenerating: 'ご要望に基づいてレンダリングを再生成中...',
    
    // Material Details
    category: 'カテゴリー',
    estimatedPrice: '推定単価',
    installCost: '設置コスト',
    ecoLevel: 'エコレベル',
    maintenanceCycle: 'メンテナンスサイクル',
    years: '年',
    materialFeatures: '材料特性',
    noPriceInfo: 'この材料の価格情報はありません',
    clickHotspot: '画像のホットスポットをクリックして詳細な材料分析を表示',
    
    // Showroom
    nearbyShowrooms: '近くのショールーム',
    viewAllShowrooms: 'すべて表示',
    showrooms: '件のショールーム',
    
    // Report View
    budgetSummary: '概算造价汇总',
    budgetSummaryDesc: 'AI分析とブランドデータベースに基づく動的予算レポート。',
    importRevit: 'Revit明細表をインポート',
    exportPDF: 'PDFレポートをエクスポート',
    quantityList: '数量リスト',
    totalMaterials: '合計',
    materialName: '材料名',
    quantity: '数量',
    unit: '単位',
    unitPrice: '単価',
    totalPrice: '合計金額',
    totalBudget: '総概算',
    
    // Cost Analysis
    costAnalysis: 'コスト構成分析',
    budgetHealth: '予算健全性',
    budgetInRange: '予算は適正範囲内です',
    budgetInRangeDesc: '現在のコストは類似プロジェクトの平均と一致しています。',
    
    // Change Material Modal
    changeMaterialTitle: '材料変更リクエスト',
    changeMaterialDesc: 'AIに現在の装飾プランをどのように変更したいかを伝えてください。新しいレンダリングを生成し、予算を更新します。',
    changeMaterialPlaceholder: '例：床をダークウォールナットに変更、大理石のアクセントウォールを追加...',
    cancel: 'キャンセル',
    regenerate: '再生成',
    
    // Brand Database Modal
    brandDbTitle: 'ブランドデータベース管理',
    addBrand: 'ブランド情報を追加',
    brandName: 'ブランド名',
    brandNamePlaceholder: '例：TARA Wood',
    mainCategory: 'メインカテゴリー',
    subCategory: 'サブカテゴリー',
    subCategoryPlaceholder: '例：木目タイル',
    modelSpec: 'モデル/仕様',
    modelSpecPlaceholder: '例：ノルディックオーク XL',
    price: '価格',
    supplierName: 'サプライヤー名',
    saveBrand: 'ブランドを保存',
    importData: 'データをインポート',
    close: '閉じる',
    newBrand: '新規ブランド',
    
    // Settings Modal
    settingsTitle: '設定',
    generalSettings: '一般設定',
    defaultCurrency: 'デフォルト通貨',
    currencyUnit: 'レポートの通貨単位',
    measurementUnit: '計量単位',
    measurementUnitDesc: '数量のデフォルト単位',
    squareMeter: '平方メートル',
    cubicMeter: '立方メートル',
    meter: 'メートル',
    aiModelSettings: 'AIモデル設定',
    visionModel: 'ビジョンモデル',
    imageModel: '画像モデル',
    apiKey: 'APIキー',
    apiKeyPlaceholder: 'sk-...を入力',
    apiKeyDesc: '空欄の場合はシステムデフォルトを使用',
    currentVersion: '現在のバージョン',
    saveSettings: '設定を保存',
    
    // Language
    language: '言語',
    languageDesc: 'アプリのインターフェース言語',
    chinese: '中文',
    english: 'English',
    japanese: '日本語',
    
    // Footer
    currentBudget: '現在の概算総額',
    identifiedMaterials: '識別された材料',
    viewFullReport: '完全なレポートを表示',
    saveProject: 'プロジェクトを保存',
    
    // Progress
    preparingData: '画像データを準備中...',
    identifyingSpace: 'AIが空間構造と材料を識別中...',
    generatingReport: '概算レポートを生成中...',
    submittingTask: '生成タスクを送信中...',
    thinkingLayout: 'AIが空間レイアウトを計画中...',
    renderingDetails: '材料の詳細をレンダリング中...',
    postProcessing: 'ライティングとシャドウのポスト処理中...',
    applyingEffect: '新しいレンダリングを適用中...',
    
    // Analysis Progress
    spaceIdentification: '空間識別',
    materialAnalysis: '材料分析',
    reportGeneration: 'レポート生成',
    aiAnalyzing: 'AIが分析中',
    aiGeneratingImage: 'AIが画像を生成中',
    
    // Alerts
    confirmNewProject: '新規プロジェクトを作成しますか？保存されていない変更は失われます。',
    fillBrandInfo: '完全なブランド情報を入力してください',
    analysisFailed: '分析に失敗しました',
    imageGenFailed: '画像生成に失敗しました',
    unknownError: '不明なエラー',
    
    // Categories
    flooring: 'フローリング',
    tile: 'タイル',
    paint: '塗料',
    bathroom: 'バスルーム',
    lighting: '照明',
    hardware: '金物',
    furniture: '家具',
    kitchenAppliance: 'キッチン家電',
    other: 'その他',
    
    // Material types
    solidWoodFlooring: '無垢フローリング',
    woodGrainTile: '木目タイル',
    
    // Recommended
    recommended: '推奨',
  },
};

export const getLocale = (lang: Language) => locales[lang];