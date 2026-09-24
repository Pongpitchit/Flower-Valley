export const PAINT_MODELS = [
 {id:'cat',name:'แมวน้อย',description:'เพื่อนตัวนุ่มที่ชอบนั่งมองสวน'},
 {id:'dog',name:'โกลเด้น',description:'เพื่อนใจดีที่พร้อมจะยิ้มให้คุณ'},
 {id:'rabbit',name:'กระต่าย',description:'หูยาวนุ่มนิ่มกับจมูกเล็ก ๆ'},
 {id:'tortoise',name:'เต่าน้อย',description:'เติมสีสันให้กระดองในแบบคุณ'},
 {id:'guinea',name:'หนูตะเภา',description:'ก้อนความสุขตัวจิ๋ว'},
] as const;
export type PaintModelId=typeof PAINT_MODELS[number]['id'];
export const validModelPaint=(v:any)=>PAINT_MODELS.some(m=>m.id===v?.modelId)&&v.colors&&typeof v.colors==='object'&&!Array.isArray(v.colors)&&Object.keys(v.colors).length>0&&Object.keys(v.colors).length<=64&&Object.entries(v.colors).every(([key,color])=>/^\d{1,2}$/.test(key)&&typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color));
