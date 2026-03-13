const QWEN_API_KEY = "sk-b48577b26a94459bb602dfbc89470365";

// 北京 endpoint（API Key 是北京地域的）
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

// 重试函数
async function fetchWithRetry(url, options, maxRetries = 3, timeout = 60000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`API attempt ${attempt}/${maxRetries}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${attempt} failed with status ${response.status}:`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        if (response.status >= 400 && response.status < 500) {
          throw lastError;
        }
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        throw lastError;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} error:`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = 2000 * attempt;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  }
  
  throw lastError;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  console.log("API called:", url, req.method);

  // /api/analyze
  if (url.includes('/api/analyze') && req.method === 'POST') {
    let body = {};
    try {
      body = req.body || {};
    } catch (e) {
      console.error("Parse body error:", e);
    }
    
    const { image, prompt, model } = body;
    const modelName = model || "qwen3-vl-plus";

    if (!image) {
      return res.status(400).json({ error: "请提供图片数据" });
    }

    try {
      const response = await fetchWithRetry(
        `${BASE_URL}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${QWEN_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ 
              role: "user", 
              content: [
                { type: "image_url", image_url: { url: image } },
                { type: "text", text: prompt }
              ]
            }],
            response_format: { type: "json_object" }
          })
        },
        3,
        90000
      );

      const data = await response.json();
      
      if (data.error) {
        console.error("API error:", data.error);
        return res.status(500).json({ error: data.error.message || "AI 服务返回错误" });
      }
      
      const content = data.choices?.[0]?.message?.content;
      console.log("AI response content:", content?.substring(0, 500));
      
      if (!content) {
        console.error("No content in response");
        return res.status(500).json({ error: "AI 未返回有效内容，请重试" });
      }
      
      // 尝试多种方式解析 JSON
      let parsed = null;
      
      // 方式1：直接解析
      try {
        parsed = JSON.parse(content);
      } catch (e1) {
        // 方式2：提取第一个 JSON 对象
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            // 方式3：提取 ```json ... ``` 中的内容
            const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
              try {
                parsed = JSON.parse(codeBlockMatch[1].trim());
              } catch (e3) {}
            }
          }
        }
      }
      
      if (parsed) {
        // 确保返回正确的格式
        const result = {
          hotspots: parsed.hotspots || [],
          materials: parsed.materials || []
        };
        console.log("Analysis successful, hotspots:", result.hotspots.length, "materials:", result.materials.length);
        return res.json(result);
      }
      
      console.error("Failed to parse JSON from content:", content.substring(0, 1000));
      return res.status(500).json({ error: "AI 返回格式异常，请重新上传图片" });
    } catch (error) {
      console.error("Analysis failed:", error.message);
      const errorMessage = error.message.includes('timeout') || error.message.includes('abort') 
        ? "AI 分析超时，请稍后重试"
        : error.message.includes('fetch') || error.message.includes('Connect')
        ? "网络连接失败，请检查网络后重试"
        : `分析失败: ${error.message}`;
      return res.status(500).json({ error: errorMessage });
    }
  }

  // /api/generate-image
  if (url.includes('/api/generate-image') && req.method === 'POST') {
    const { prompt, apiKey: clientApiKey, model: clientModel } = req.body || {};
    const apiKey = clientApiKey || QWEN_API_KEY;
    const modelName = clientModel || "wanx2.1-t2i-turbo";

    if (!apiKey) {
      return res.status(500).json({ error: "API Key 未设置" });
    }

    try {
      // 使用文生图 API
      const response = await fetchWithRetry(
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable"
          },
          body: JSON.stringify({
            model: modelName,
            input: { 
              prompt: prompt
            },
            parameters: { 
              style: "<auto>",
              size: "1024*1024", 
              n: 1 
            }
          })
        },
        2,
        30000
      );

      const initialData = await response.json();
      
      if (initialData.error || (initialData.code && initialData.code !== "ok")) {
        console.error("Image generation start error:", initialData);
        return res.status(500).json({ error: initialData.message || "图片生成启动失败" });
      }

      const taskId = initialData.output?.task_id;
      if (!taskId) {
        return res.status(500).json({ error: "未获取到任务ID" });
      }
      
      let taskStatus = "PENDING";
      let resultData = null;
      
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        resultData = await statusRes.json();
        taskStatus = resultData.output?.task_status || "PENDING";
        if (taskStatus === "SUCCEEDED" || taskStatus === "FAILED") break;
      }

      if (taskStatus === "SUCCEEDED") {
        const imageUrl = resultData.output?.results?.[0]?.url;
        if (imageUrl) {
          const imgRes = await fetch(imageUrl);
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return res.json({ image: `data:image/png;base64,${base64}` });
        }
      }
      
      return res.status(500).json({ error: `图片生成${taskStatus === 'FAILED' ? '失败' : '超时'}` });
    } catch (error) {
      console.error("Image generation failed:", error.message);
      return res.status(500).json({ error: "图片生成服务暂时不可用" });
    }
  }

  // /api/brands
  if (url.includes('/api/brands')) {
    return res.json([
      { id: 1, name: "泰拉木业", material_type: "木地板", price: 720 },
      { id: 2, name: "诺贝尔瓷砖", material_type: "瓷砖", price: 120 },
      { id: 3, name: "立邦漆", material_type: "涂料", price: 45 }
    ]);
  }

  // /api/materials
  if (url.includes('/api/materials')) {
    return res.json([
      { id: 1, name: "实木地板", type: "木地板", base_price_min: 100, base_price_max: 200 },
      { id: 2, name: "瓷砖", type: "瓷砖", base_price_min: 80, base_price_max: 150 },
      { id: 3, name: "乳胶漆", type: "涂料", base_price_min: 30, base_price_max: 60 }
    ]);
  }

  return res.status(404).json({ error: "Not found: " + url });
}