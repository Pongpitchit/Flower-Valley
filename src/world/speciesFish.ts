// Original geometry modeled for freshwater species; all face +X.
export function speciesFish(_w:any,index:number) {
  const T=window.AFRAME.THREE,g=new T.Group();
  const cat=index===5,koi=index===2;
  const material=(color:string)=>new T.MeshStandardMaterial({color,roughness:.6,side:T.DoubleSide});
  const body=material(cat?'#414c45':koi?'#f3eee2':'#f38b18'),fin=material(cat?'#5c6559':koi?'#eee3c9':'#ffb43f');
  const mesh=(geo:any,m:any,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent=g)=>{geo.userData.owned=true;const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;};
  const sphere=()=>new T.SphereGeometry(1,20,12);
  mesh(sphere(),body,0,0,0,cat?.44:koi?.39:.28,cat?.1:koi?.14:.21,cat?.15:koi?.12:.17);
  mesh(sphere(),body,.27,cat?-.01:0,0,cat?.2:.15,cat?.085:.13,cat?.2:.12);
  const eye=material('#141b17');for(const side of [-1,1])mesh(sphere(),eye,.33,.045,side*(cat?.16:.105),.018,.023,.012);
  const tail=new T.Group();tail.position.x=cat?-.41:koi?-.36:-.24;g.add(tail);g.userData.tail=tail;
  const fan=(parent:any,x:number,y:number,z:number,length:number,height:number,m:any,rot=0)=>{
    const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(-length*.45,height*.2,-length,height);shape.quadraticCurveTo(-length*.75,0,-length,-height);shape.quadraticCurveTo(-length*.45,-height*.2,0,0);
    const o=mesh(new T.ShapeGeometry(shape,8),m,x,y,z,1,1,1,parent);o.rotation.x=rot;return o;
  };
  if(cat){fan(tail,0,0,0,.2,.09,fin);mesh(sphere(),fin,-.09,.105,0,.26,.04,.016);
    for(const side of [-1,1])for(let i=0;i<3;i++){
      const curve=new T.CatmullRomCurve3([new T.Vector3(.4,-.025,side*.07),new T.Vector3(.49,-.055,side*(.14+i*.045)),new T.Vector3(.29-i*.04,-.08,side*(.29+i*.055))]);
      mesh(new T.TubeGeometry(curve,10,.006,4,false),fin,0,0,0);
    }
  } else {
    fan(tail,0,0,0,koi?.24:.33,koi?.17:.27,fin,.18);
    if(!koi)fan(tail,0,0,0,.3,.23,fin,-.55);
    mesh(sphere(),fin,-.06,koi?.15:.22,0,.16,.09,.015);
    if(koi){const red=material('#cf472b');for(const [x,z,sx] of [[.17,0,.095],[-.02,.075,.13],[-.22,-.04,.075]])mesh(sphere(),red,x,.095,z,sx,.047,.075);}
  }
  for(const side of [-1,1])fan(g,.08,-.04,side*.11,.17,.07,fin,side*1.0);
  return g;
}
