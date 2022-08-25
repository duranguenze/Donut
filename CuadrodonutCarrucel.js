
///////////////////////////////////////////
class Grafica{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{
                Canvas:{},
                Elementos:1,
                Padre:{},
                click:function(elemento){},
                prechange:function(elemento){},
                change:function(elemento){},
        }, Propiedades);
        this.x=this.y=0;
        this.colors = [];
        this.colors.push("lightgrey");
        this.colors.push("blue");
        this.Sectores=[];
        this.SectorIndice={};
        this.Capas=[];
        this.eventos=[];
        this.Canvas= AtributosObjeto.Canvas;
        this.Padre= AtributosObjeto.Padre;
        this.ClickZone=document.createElement("canvas");
        this.ColorClickable='black';
        this.ClickZone.width = this.Canvas.width;
        this.ClickZone.height= this.Canvas.height;
        this.Canvas.Parent=this;
        this.Canvas.addEventListener('mousedown', e => {
            e.currentTarget.Parent.clickSector(e.offsetX,e.offsetY,e);
        });
        this.Canvas.addEventListener('mousemove', function(e){
            /////////////////////
            let x=e.offsetX;
            let y=e.offsetY;
            let Indice=0;
            x=x<=e.currentTarget.Parent.Canvas.width&&x>=0?x:0;
            y=y<=e.currentTarget.Parent.Canvas.height&&y>=0?y:0;

            let ColorPixel=e.currentTarget.Parent.ClickZone.getContext('2d').getImageData(x,y,1,1).data;
            Color ='#'+
                (('00'+ColorPixel[0].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
                (('00'+ColorPixel[1].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
                (('00'+ColorPixel[2].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''));
            if(e.currentTarget.Parent.ColorClickable==Color)
            for(Indice=0;Indice<e.currentTarget.Parent.Capas.length;Indice++){
                let Capa=e.currentTarget.Parent.Capas[Indice];
                if(typeof(Capa.Ligas)!='undefined'){
                    if(Capa.Ligas[e.currentTarget.Parent.ElementoActual].tagName!='A'){
                        Color='';
                        break;
                    }
                }
            };
            if(e.currentTarget.Parent.ColorClickable==Color){
                this.style.cursor='pointer';
            }else{
                this.style.cursor='';
            }
        });
        this.eventos={
            click:[],
            prechange:[],
            change:[]
        };
        this.eventos.click.push(AtributosObjeto.click);
        this.eventos.prechange.push(AtributosObjeto.prechange);
        this.eventos.change.push(AtributosObjeto.change);
        this.Capas.push(new LimpiarCanvas(this.Canvas));
    
        this.Capas.push(new AnimacionCambioSector({
                Canvas:this.Canvas,
                Padre:this
            })
        );
        this.Capas.push({});

        this.Espera=true;
        this._Espera=true;
        this.NoDibujar=true;
        this.ElementoActual=
        this.ElementoAnterior=0;

        Object.defineProperty(this, 'Elementos', {
            get: function() {return this._Elementos;},
            set: function(newValue) {this._Elementos = newValue; this.Calcular();},
            enumerable: true,
            configurable: true
        });
        this.Elementos=AtributosObjeto.Elementos;
        return this;
    }
    Destruir(){
		let Imagenes=this.Canvas.Padre.getElementsByTagName('img');
		let j;
		for(j=0;j<Imagenes.length;j++){
		    Imagenes[j].style.display='';
		}
		this.ClickZone.remove();
		this.Canvas.Padre.Circular=undefined;
		this.Canvas.Padre=undefined;
		this.Canvas.remove();
    }
    Calcular(){
        let i=0;
        let Grosor=5;
        let SectorActual={};
        let Margen=10;
        let Cx= Math.floor(this.Canvas.width/2);
        let Cy= Math.floor(this.Canvas.height/2);
        let R1=Math.min(Cx, Cy)-Margen;
        let R2=R1-Grosor;
        let EndAngle=0;
        let StartAngle=0;
        let AnguloAnterior=0;
        let AnguloNuevo=0;
        let Color='';
        this.Angulo=(-Math.PI*2)/this.Elementos;
        this.Capas.pop();
        //if(!(Elementos%2))
        {
          AnguloAnterior=Math.PI/2;
          AnguloNuevo+=AnguloAnterior;
        }
        if(this.Elementos>=this.Sectores.length){
            for(var j=0;j<this.Sectores.length;j++){
                AnguloNuevo=this.Angulo+AnguloNuevo;
                this.Sectores[j].AsignarAngulo({StartAngle:AnguloAnterior, EndAngle:AnguloNuevo});
                AnguloAnterior=AnguloNuevo;
            }
        }else{
            for(var j=0;j<this.Elementos;j++){
                AnguloNuevo=this.Angulo+AnguloNuevo;
                this.Sectores[j].AsignarAngulo({StartAngle:AnguloAnterior, EndAngle:AnguloNuevo});
                AnguloAnterior=AnguloNuevo;
            }
            for(var j=this.Elementos;j<this.Sectores.length;j++){
                this.Sectores[j].AsignarAngulo({StartAngle:0, EndAngle:0});
            }
        }

        for(var j=this.Sectores.length;j<this.Elementos;j++){
            AnguloNuevo=this.Angulo+AnguloNuevo; 
            Color=getRandomColor();
            this.SectorIndice[Color]=j;
            SectorActual=new Sector({
                StartAngle:AnguloAnterior,
                EndAngle:AnguloNuevo,
                Cx:Cx,
                Cy:Cy,
                R1:R1,
                R2:R2,
                Canvas:this.Canvas,
                Padre:this,
                ClickZone:this.ClickZone,
                ColorZona: Color
            });
            this.Sectores.push(SectorActual);
            this.Capas.push(SectorActual);
            AnguloAnterior=AnguloNuevo;
	    }
	    if(this.ElementoActual<this.Sectores.length) this.Sectores[this.ElementoActual].Color=this.colors[1];
	    this.Capas.push(new RestaurarCanvas(this.Canvas));
	    //this.Espera=false;
	    this.ColorClickable=getRandomColor();
	    return this;
    }
  	AsignarColor(Incremento){
        for(var j=0;j<this.Sectores.length;j++){
            this.Sectores[j].Color=this.colors[0];
        }
        if(this.ElementoActual<this.Sectores.length)
            this.Sectores[this.ElementoActual].Color=this.colors[1];
        this.Capas.filter(Capa=>typeof(Capa.Animacion)!='undefined').map(Capa=>Capa.Animacion(Incremento));
        for(let i=0;i<this.eventos.prechange.length;i++) 
            if(this.eventos.prechange[i](this))  // CallprechangeEvent
                i=this.eventos.prechange.length;//Stop Propagation
        return this;
    }
	Siguiente(){
        this.ElementoAnterior=this.ElementoActual;
        this.ElementoActual++;
        if(this.ElementoActual>=this.Sectores.length)this.ElementoActual=0;
        return this.AsignarColor(1);
  	}
  	Anterior(){
        this.ElementoAnterior=this.ElementoActual;
        this.ElementoActual--;
        if(this.ElementoActual<0)this.ElementoActual=Math.max(this.Sectores.length-1,0);
        return this.AsignarColor(-1);
  	}
  	AsignarElemento(ElementoActual){
        this.ElementoAnterior=this.ElementoActual;
        this.ElementoActual=Math.max(0,ElementoActual);
        if(this.ElementoActual>=this.Sectores.length)this.ElementoActual=0;
        return this.AsignarColor(this.ElementoAnterior>this.ElementoActual?-1:1);
  	}
  	clickSector(x,y,e){
        let IndiceActual=0;
        let Color='';
        x=x<=this.Canvas.width&&x>=0?x:0;
        y=y<=this.Canvas.height&&y>=0?y:0;
        this.x=x;
        this.y=y;
        let ColorPixel=this.ClickZone.getContext('2d').getImageData(x,y,1,1).data;
            Color ='#'+
                (('00'+ColorPixel[0].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
                (('00'+ColorPixel[1].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
                (('00'+ColorPixel[2].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''));
        if(this.ColorClickable==Color){
            let Indice;
            let Capa;
            for(Indice=0;Indice<this.Capas.length;Indice++){
                Capa=this.Capas[Indice];
                if(typeof(Capa.Ligas)!='undefined'){
                    Capa.Ligas[this.ElementoActual].click();
                }
            };
        }else{
            if(typeof(this.SectorIndice[Color])!='undefined'){
                IndiceActual=this.SectorIndice[Color];
            }else{
                this.Sectores.map(function(Sector,Indice){
                    if(typeof(Sector.clickSector)!='undefined'
                        &&Sector.clickSector(x,y))IndiceActual=Indice;
                });
            }
            for(let i=0;i<this.eventos.click.length;i++) 
                if(this.eventos.click[i](this))  // CallClickEvent
                    i=this.eventos.click.length;//Stop Propagation
            if(this.ElementoActual!=IndiceActual)
            return this.AsignarElemento(IndiceActual);
        }
        return this;
  	}
  	DibujarCuadro(){
    	this.NoDibujar=false;
        return this.Dibujar();
	}
      Dibujar(Hijo){
        this.Espera=!this.NoDibujar&&this.Capas.filter(Capa=>Capa.Espera).length==0;
        if(this.Espera){
            if(this._Espera!=this.Espera)this._Espera=false;
            this.Espera=false;//Bloqueamos otros movimientos
            let ctx = this.Canvas.getContext('2d');
            let ctx2 = this.ClickZone.getContext('2d');
            this.ClickZone.width = this.Canvas.width;
            this.ClickZone.height= this.Canvas.height;
            ctx.clearRect(0,0,this.Canvas.width,this.Canvas.height);
            ctx2.clearRect(0,0,this.ClickZone.width,this.ClickZone.height);
            ctx2.save();
                ctx2.beginPath();
                ctx2.fillStyle = this.ColorClickable;
                ctx2.fillRect(0, 0, this.ClickZone.width, this.ClickZone.height);
                ctx2.closePath();
                ctx2.fill();
            ctx2.restore();
            this.Capas.map(Capas=>Capas.Dibujar());
            this.Espera=true;//Liberamos otros movimientos
            typeof(this.Padre.Dibujar)!='undefined'&&this.Padre.Dibujar(this);//Lanzamos evento padre
        }else if(!this._Espera){
            this._Espera=true;
            for(let i=0;i<this.eventos.change.length;i++) 
                if(this.eventos.change[i](this))  // CallchangeEvent
                    i=this.eventos.change.length;//Stop Propagation
        }
        return this
  	}
 	unshift(Objeto){
        Objeto.Padre=this;
        this.Capas.unshift(Objeto);
        return this;
  	}
  	shift(){
        let Objeto=this.Capas.shift();
        Objeto.Padre={};
        return Objeto;
  	}
  	push(Objeto){
        Objeto.Padre=this;
        this.Capas.push(Objeto);
        return this;
  	}
  	pop(){
	    let Objeto=this.Capas.pop();
	    Objeto.Padre={};
	    return Objeto;
  	}
}

///////////////////////////////
class CatalogoImagenes{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{
            Imagenes:[],
            Padre:{Espera:false},
            Indice:0,
            Canvas:{},
            Radio:0,
            Rate:10,
            Animar:false
        }, Propiedades);
        let i=0;
        this.Imagenes=[];
        this.Ligas=[];
        for(i=0;i<AtributosObjeto.Imagenes.length;i++){
            if(typeof(AtributosObjeto.Imagenes[i].src)!='undefined'){
                this.Imagenes[i]=AtributosObjeto.Imagenes[i].src;
                this.Ligas[i]=AtributosObjeto.Imagenes[i].liga;
            }else{
                this.Imagenes[i]=AtributosObjeto.Imagenes[i];
                this.Ligas[i]={};
            }
        }
        
        this.Canvas=AtributosObjeto.Canvas;
        this.Padre=AtributosObjeto.Padre;
        this.Indice=AtributosObjeto.Indice;
        this.Radio=AtributosObjeto.Radio;
        this.Rate=AtributosObjeto.Rate;
        this.Animar=AtributosObjeto.Animar;

        this.CanvasFondo=document.createElement("canvas");
        this.CanvasFondo.height=this.Canvas.height;
        this.CanvasFondo.width=this.Canvas.width*this.Imagenes.length;
        this.Espera=true;
        this.img=new Image();
        this.img.Padre=this;
        this._Rate=this._inc=this.img.indice=this.w=this.h=this._w=this._h=this.x=this._x=this.y=this._y=0;
        this.w=this.cw=this.Canvas.width;
        this.h=this.ch=this.Canvas.height;
        this.img.onload= function(){
            let ctx=this.Padre.CanvasFondo.getContext("2d");
            let cw=this.Padre.Canvas.width;
            let ch=this.Padre.Canvas.height;
            let cw2=ch*this.width/this.height;
            let CanvasImagenRec=document.createElement("canvas");
            CanvasImagenRec.width=ch;
            CanvasImagenRec.height=ch;
            let ctx2=CanvasImagenRec.getContext('2d');
            ctx2.save();
                ctx2.drawImage(this,(cw-cw2)/2,0,cw2,ch);
                ctx2.globalCompositeOperation='destination-in';
                ctx2.beginPath();
                ctx2.fillRect(0, 0, cw, ch);
                ctx2.closePath();
                ctx2.fillStyle = 'black';
                ctx2.fill();
            ctx2.restore();
            ctx.save();
                ctx.drawImage(CanvasImagenRec,cw*this.indice,0,cw,ch);
            ctx.restore();

            if(this.Padre.Imagenes.length<=this.indice+1){
                this.Padre.Espera=false;
                if(typeof(this.Padre)!='undefined'){
                    if(typeof(this.Padre.Padre)!='undefined')
                        this.Padre.Padre.Dibujar();
                    else
                        this.Padre.Dibujar();
                }
            }else
                this.Padre.CargarImagen(this.indice+1);
        }
        if(this.Imagenes.length>0) this.CargarImagen(0);
    }
    CargarImagen(i){
        this.img.indice=i;
        if(this.Imagenes.length>i) this.img.src=this.Imagenes[i];
    }
    Animacion(Incremento){
        let AnchoVentana=0;
        let PosicionActual=0;
        if(this.Imagenes.length>1)AnchoVentana=this.CanvasFondo.width/this.Imagenes.length;
        if(this.Animar){
            if(this._Rate/(90+this.Rate)>=1)this._Rate=0;
            PosicionActual=parseInt(this.Imagenes.length*this._Rate/(90+this.Rate));
            this._Rate++;
        }else
            PosicionActual=this.Padre.ElementoActual;
        this._x=-AnchoVentana*PosicionActual;
        if(this.Animar)this.x=this._x;
        this._inc=(this._x-this.x)/Math.max(1,this.Rate);

    }
    Dibujar(){
        let ctx=this.Canvas.getContext("2d");
        let CanvasImagenCirc=document.createElement("canvas");
        CanvasImagenCirc.width=this.Canvas.width;CanvasImagenCirc.height=this.Canvas.height;
        let ctx2=CanvasImagenCirc.getContext("2d");
        if(Math.abs(this._x-this.x)>=Math.abs(this._inc)){
            this.x+=this._inc;
        }else{
            this.x=this._x;
            this._inc=0;
        }
        ctx2.save();
            ctx2.drawImage(this.CanvasFondo,this.x,this.y);
            if(this.x>0)ctx2.drawImage(this.CanvasFondo,this.x-this.CanvasFondo.width,this.y);
            if(this.x+this.CanvasFondo.width<=0)ctx2.drawImage(this.CanvasFondo,this.x+this.CanvasFondo.width,this.y);
            if(this.Radio>0){//Recortamos en circulo, si es que se requiere
                ctx2.globalCompositeOperation='destination-in';
                ctx2.beginPath();
                    ctx2.arc(this.cw/2,this.ch/2,this.Radio,0,Math.PI*2);
                ctx2.closePath();
                ctx2.fillStyle = 'black';
                ctx2.fill();
            }
        ctx2.restore();
        ctx.save();
            ctx.drawImage(CanvasImagenCirc,0,0);
        ctx.restore();
        this.Animar&&this.Animacion(1);
        return this;
    }
}

//////////////////////////////////

class ImagenCircular{
    constructor(Propiedades){
    let AtributosObjeto=Object.assign({},{
        Radio:0,
        Imagen:"",
        Canvas:{},
        Padre:{Espera:false}
    }, Propiedades);
    this.Radio=AtributosObjeto.Radio;
    this.Imagen=AtributosObjeto.Imagen;
    this.Canvas=AtributosObjeto.Canvas;
    this.Padre=AtributosObjeto.Padre;
    //this.cargarImagen=Propiedades.cargarImagen
    this.Espera=true;
    this.img=new Image();
    this.img.Padre=this;
    this.img.ImagenCircular=this;
    this.img.onload= 
    function() {
      this.CanvasProp=document.createElement("canvas");
      //this.CanvasProp=this.Padre.Canvas;
      let ctx=this.CanvasProp.getContext("2d");
      let cw=this.CanvasProp.width=this.Padre.Canvas.width;
      let ch=this.CanvasProp.height=this.Padre.Canvas.height;
      let proporcion=Math.max(this.width,this.height)*2*this.Padre.Radio/(this.width*this.height);
      ctx.save();
        ctx.drawImage(this,0,0,this.width*proporcion,this.height*proporcion);
        ctx.globalCompositeOperation='destination-in';
        ctx.beginPath();
        ctx.arc(cw/2,ch/2,this.Padre.Radio,0,Math.PI*2);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();
      ctx.restore();
      this.Padre.Espera=false;
      if(typeof(this.Padre)!='undefined'){
        if(typeof(this.Padre.Padre)!='undefined')
            this.Padre.Padre.Dibujar();
         else
            this.Padre.Dibujar();
      }
    }
    this.img.src=this.Imagen;
  }
  Dibujar(){
    let ctx=this.Canvas.getContext("2d");
    ctx.save();
        ctx.drawImage(this.img.CanvasProp,0,0);
    ctx.restore();
  }
}

//////////////////////////////////////////


class AnimacionCambioSector{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{
            Canvas:{},
            Padre:{},
            Rate:10
        }, Propiedades);
        this.Canvas=AtributosObjeto.Canvas;
        this.Padre=AtributosObjeto.Padre;
        this.Rate=AtributosObjeto.Rate;
        this.ElementoActual=this.ElementoAnterior=this.Padre.ElementoActual;
        this.Angulo=this.Padre.Angulo;
        this._Angulo=0;
    }
    Dibujar(){
        let ctx=this.Canvas.getContext("2d");
        ctx.save();
        if(Math.abs(this.Angulo)>Math.abs(this._inc)){
             ctx.translate(this.Canvas.width/2 ,this.Canvas.height/2);
            ctx.rotate(this.Angulo);
            ctx.translate(-this.Canvas.width/2 ,-this.Canvas.height/2);
            this.Angulo+=this._inc;
        }else this.Angulo=this._Angulo;
    }
    Animacion(Incremento){ 
        this.Angulo=Math.abs(this.Padre.Angulo)*Incremento;
        this._inc=-Math.abs(this.Padre.Angulo)/Math.max(1,this.Rate)*Incremento;
    }
}



class ImagenEstatica{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{
            Imagenes:[],
            Padre:{Espera:false},
            Indice:0,
            Canvas:{}
        }, Propiedades);
        this.Imagenes=AtributosObjeto.Imagenes;
        this.Canvas=AtributosObjeto.Canvas;
        this.Padre=AtributosObjeto.Padre;
        this.Indice=AtributosObjeto.Indice;
        this.CanvasFondo=document.createElement("canvas");
        this.CanvasFondo.height=this.Canvas.height;
        this.CanvasFondo.width=this.Canvas.width*this.Imagenes.length;
        this.Espera=true;
        this.img=new Image();
        this.img.Padre=this;
        this._inc=this.img.indice=this.w=this.h=this._w=this._h=this.x=this._x=this.y=this._y=0;
        this.w=this.cw=this.Canvas.width;
        this.h=this.ch=this.Canvas.height;
        this.img.onload= function(){
            let ctx=this.Padre.CanvasFondo.getContext("2d");
            let cw=this.Padre.Canvas.width;
            let ch=this.Padre.Canvas.height;
            let cw2=ch*this.width/this.height;
            let CanvasImagenRec=document.createElement("canvas");
            CanvasImagenRec.width=ch;
            CanvasImagenRec.height=ch;
            let ctx2=CanvasImagenRec.getContext('2d');
            ctx2.save();
                ctx2.drawImage(this,0,0,cw2,ch);
                ctx2.globalCompositeOperation='destination-in';
                ctx2.beginPath();
                ctx2.fillRect(0, 0, cw, ch);
                ctx2.closePath();
                ctx2.fillStyle = 'black';
                ctx2.fill();
            ctx2.restore();
            ctx.save();
                ctx.drawImage(CanvasImagenRec,0,0,cw,ch);
            ctx.restore();

            if(this.Padre.Imagenes.length<=this.indice+1){
                this.Padre.Espera=false;
                if(typeof(this.Padre)!='undefined'){
                    if(typeof(this.Padre.Padre)!='undefined')
                        this.Padre.Padre.Dibujar();
                    else
                        this.Padre.Dibujar();
                }
            }else
                this.Padre.CargarImagen(this.indice+1);
        }
        if(this.Imagenes.length>0) this.CargarImagen(0);
    }
    CargarImagen(i){
        this.img.indice=i;
        if(this.Imagenes.length>i) this.img.src=this.Imagenes[i];
    }
    Dibujar(){
        let ctx=this.Canvas.getContext("2d");
        ctx.save();
            ctx.drawImage(this.CanvasFondo,0,0);
        ctx.restore();
    }
}

/////////////////////////////////////


class LimpiarCanvas{
  constructor(Canvas){
    this.Canvas=Canvas;
  }
  Dibujar(){
    let ctx = this.Canvas.getContext('2d');
    ctx.save();
    /*ctx.shadowColor = "gray";
    ctx.shadowBlur = 10;//almenos igual a Margen
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "gray";*/
  }
}
////////////////////////////////////
class RestaurarCanvas{
    constructor(Canvas){
    this.Canvas=Canvas;
  }
  Dibujar(){
    let ctx = this.Canvas.getContext('2d');
    ctx.restore();
  }
}

//////////////////////////////

class Sector{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{
            Cx:0,
            Cy:0,
            R1:0,
            R2:0,
          StartAngle:0,
          EndAngle:Math.PI*2,
            ColorLinea:'white',
            Color:'lightgrey',
          Canvas:{},
            Sentido:false,
          anchoLinea:2,
          Pasos:0,
          ColorZona:'blue',
          ClickZone:false
        }, Propiedades);
        this.Espera=false;
        this.Cx=AtributosObjeto.Cx;
        this.Cy=AtributosObjeto.Cy;
        this.R1=AtributosObjeto.R1;
        this.R2=AtributosObjeto.R2;
        this.EndAngle=AtributosObjeto.EndAngle;
        this.StartAngle=AtributosObjeto.StartAngle;

        this._EndAngle=AtributosObjeto.EndAngle;
        this._StartAngle=AtributosObjeto.StartAngle;

        this.ColorLinea=AtributosObjeto.ColorLinea;
        this.Color=AtributosObjeto.Color;
        this.Canvas=AtributosObjeto.Canvas;
        this.Sentido=AtributosObjeto.Sentido;
        this.anchoLinea = AtributosObjeto.anchoLinea;
        this.Pasos=AtributosObjeto.Pasos;
        this.ColorZona=AtributosObjeto.ColorZona;
        if(AtributosObjeto.ClickZone===false){
            this.ClickZone=document.createElement("canvas");
            this.ClickZone.width = this.Canvas.width;
            this.ClickZone.height= this.Canvas.height;
            this.LimpiarZona=true;
        }else{
            this.LimpiarZona=false;
            this.ClickZone=AtributosObjeto.ClickZone;
        }
        return this;
    }
    AsignarAngulo(Propiedades){
        let AtributosObjeto=Object.assign({},{
            Cx:0,
            Cy:0,
            R1:0,
            R2:0,
            StartAngle:0,
            EndAngle:Math.PI*2,
            ColorLinea:'white',
            Color:'lightgrey',
            Canvas:{},
            Sentido:false,
            anchoLinea:2
        }, Propiedades);
        this.StartAngle=this._StartAngle=AtributosObjeto.StartAngle;
        this.EndAngle=this._EndAngle=AtributosObjeto.EndAngle;
        this.Paso=0;
        if(this._StartAngle!=this.StartAngle||this._EndAngle!=AtributosObjeto.EndAngle){
            this.Paso=(this.StartAngle-this._StartAngle+this.EndAngle-AtributosObjeto._EndAngle)/100;
        }
    }
    Dibujar(){
        if (!(this.StartAngle==0 &&this.EndAngle==0)&& this.Canvas.getContext) {
          let ctx = this.Canvas.getContext('2d');
          let ctx2 = this.ClickZone.getContext('2d');
            if(this._StartAngle!=this.StartAngle){
                if((Math.abs(this._StartAngle-this.StartAngle)-Math.abs(this.Pasos))<=Math.abs(this.Pasos)){
                    this.StartAngle=this._StartAngle;
                    this.Pasos=0;
                }else{
                    this.StartAngle+=this.Pasos;
                }
            }
            if(this._EndAngle!=this.EndAngle){
                if((Math.abs(this._EndAngle-this.EndAngle)-Math.abs(this.Pasos))<=Math.abs(this.Pasos)){
                    this.EndAngle=this._EndAngle;
                    this.Pasos=0;
                }else{
                    this.EndAngle+=this.Pasos;
                }
            }
            ctx.save();
              ctx.strokeStyle = this.ColorLinea;
              ctx.lineWidth = this.anchoLinea;
                ctx.beginPath();
                    //arc(x, y, radius, startAngle, endAngle, anticlockwise)
                    ctx.arc(this.Cx, this.Cy, this.R1, this.StartAngle, this.EndAngle , !this.Sentido);
                    ctx.arc(this.Cx, this.Cy, this.R2, this.EndAngle, this.StartAngle , this.Sentido);
                    ctx.closePath();
                    ctx.fillStyle = this.Color;
                    ctx.fill();
                ctx.stroke();
            ctx.restore();
            ctx2.save();
            if(this.LimpiarZona)ctx2.clearRect(0,0,this.Canvas.width,this.Canvas.height);
            ctx2.strokeStyle = this.ColorZona;
              ctx2.lineWidth = this.anchoLinea;
                ctx2.beginPath();
                    ctx2.arc(this.Cx, this.Cy, this.R1*2, this.StartAngle, this.EndAngle , !this.Sentido);
                    ctx2.arc(this.Cx, this.Cy, this.R2, this.EndAngle, this.StartAngle , this.Sentido);
                    ctx2.closePath();
                    ctx2.fillStyle = this.ColorZona;
                    ctx2.fill();
                ctx2.stroke();
            ctx2.restore();
        }
    }
    clickSector(x,y){
        let ColorPixel= this.ClickZone.getContext('2d').getImageData(x,y,1,1).data;
        return this.ColorZona===
        '#'+
            (('00'+ColorPixel[0].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
            (('00'+ColorPixel[1].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
            (('00'+ColorPixel[2].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''));
        ;
    }
}

////////////////////////////////////////

class Color{
    constructor(){
        if(typeof(window.CuadroColor)=='undefined'){
            window.CuadroColor= document.createElement("canvas");
            window.CuadroColor.height=
            window.CuadroColor.width=255;   
            this.Canvas =window.CuadroColor;
            let ctx = this.Canvas.getContext('2d');
            let cw=this.Canvas.width;
            let ch=this.Canvas.height;
            let Radio=cw/4;
            ctx.save();
                let my_gradient=ctx.createLinearGradient(0, 0, cw, 0);
                let my_gradient2=ctx.createLinearGradient(0, 0, 0, ch);
                my_gradient2.addColorStop(0,'black');
                my_gradient2.addColorStop(1,'white');

                my_gradient.addColorStop(0, "red");
                my_gradient.addColorStop(0.25, "blue");
                my_gradient.addColorStop(0.75, "green");
                my_gradient.addColorStop(1, "red");
                ctx.fillStyle = my_gradient;
                ctx.fillRect(0, 0, cw, ch);
                ctx.globalCompositeOperation='screen';
                ctx.fillStyle = my_gradient2;
                ctx.fillRect(0, 0, cw, ch);
            ctx.restore();
        }
    }
    getColor(){
        let x=0;
        let y=0;
        let color=[];
        let ColorCalculado='';
        if(typeof(window.CuadroColor)!='undefined'){
            x=parseInt(Math.random()*window.CuadroColor.width+1);
            y=parseInt(Math.random()*window.CuadroColor.height+1);
            color=window.CuadroColor.getContext('2d').getImageData(x,y,1,1).data;
        }else{
            color=[
                parseInt(Math.random()*255),
                parseInt(Math.random()*255),
                parseInt(Math.random()*255)
            ];
        }
        ColorCalculado= '#'+
            (('00'+color[1].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
            (('00'+color[2].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''))+
            (('00'+color[3].toString(16)).split('').reverse().join('').substr(0,2).split('').reverse().join(''));
        if(typeof(window.CuadroColor.ColoresAnteriores)=='undefined'){
            window.CuadroColor.ColoresAnteriores={};
        }
        if(typeof(window.CuadroColor.ColoresAnteriores[ColorCalculado])=='undefined'){
            window.CuadroColor.ColoresAnteriores[ColorCalculado]=ColorCalculado;
            return ColorCalculado;
        }else return this.getColor();
    }
}
 
/////////////////////////////////////

class MostrarFPS{
    constructor(Propiedades){
        let AtributosObjeto=Object.assign({},{ 
            Canvas:{},
            fillStyle:"Black",
            font:"normal 10pt Arial"
        }, Propiedades);
        this.Canvas=AtributosObjeto.Canvas;
        this.fillStyle=AtributosObjeto.fillStyle;
        this.font=AtributosObjeto.font;

        this.CanvasImagen=document.createElement("canvas");
        this.CanvasImagen.width=this.Canvas.width;
            this.CanvasImagen.height=this.Canvas.height;

        this.lastRun = new Date().getTime();
        this.fps=0;

        this.FuncionLlamado=
        function(){
            let ctx=MostrarFPS.Padre.CanvasImagen.getContext("2d");
            ctx.save();
                ctx.clearRect(0,0,MostrarFPS.Padre.CanvasImagen.width,MostrarFPS.Padre.CanvasImagen.height);
                ctx.fillStyle = MostrarFPS.Padre.fillStyle;
                ctx.font      = MostrarFPS.Padre.font;
                ctx.fillText((MostrarFPS.Padre.fps.toFixed(2)) + " fps", 1, 13);
            ctx.restore();
        };
        MostrarFPS.Padre=this;
        this.IntervalSec=setInterval(this.FuncionLlamado,500);
    }
    Dibujar(){
        let delta = (new Date().getTime() - this.lastRun)/1000;
        this.lastRun = new Date().getTime();
        this.fps = 1/delta;
        let ctx=this.Canvas.getContext("2d");
        ctx.save();
            ctx.drawImage(this.CanvasImagen,0,0);
        ctx.restore();
    }
}

//////////////////////////////////////////////

function getRandomColor(){
    if(typeof(getRandomColor.ColoresRandom)=='undefined') getRandomColor.ColoresRandom=new Color();
    return getRandomColor.ColoresRandom.getColor();
}


function CargarCarrucelCircular(Clase){
    let i=0;
    let SelectorGlobal=document.getElementsByClassName(Clase);
    if(SelectorGlobal.length==0){
        SelectorGlobal=document.getElementById(Clase);
    }

    let Selector={};
    for(i=0;i<SelectorGlobal.length;i++){
        let ImagenesFondo=[];
        let ImagenesElementos=[];
        let ImagenesFrente=[];
        let Imagenes={};
        let datos={};
        let j=0;
        let Canvas=document.createElement("canvas");
        Selector=SelectorGlobal[i];

        Imagenes=Selector.getElementsByTagName('canvas');
        for(j=0;j<Imagenes.length;j++)
            if(typeof(Imagenes[i].CanvasBasico)!='undefined')
                Imagenes[i].CanvasBasico.Destruir();

        Canvas.Padre=Selector;
        Canvas.ClaseUsada=Clase;
        Canvas.height=Selector.offsetHeight;
        Canvas.width=Selector.offsetWidth;
        Selector.appendChild(Canvas);
        Imagenes=Selector.getElementsByTagName('img');
        for(j=0;j<Imagenes.length;j++){
            Imagenes[j].style.display='none';
            if(Imagenes[j].classList.contains('Fondo')){
                ImagenesFondo.push(Imagenes[j].attributes.src.value);
            }else if(Imagenes[j].classList.contains('Frente')){
                ImagenesFrente.push(Imagenes[j].attributes.src.value);
            }else{
                datos={};
                if(Imagenes[j].parentElement.tagName=='A'){
                    datos.src=Imagenes[j].attributes.src.value;
                    datos.liga=Imagenes[j].parentElement;
                }else
                    datos=Imagenes[j].attributes.src.value;
                ImagenesElementos.push(datos);
            }
        }
        Canvas.CanvasBasico = new Grafica({
            Canvas:Canvas,
            Elementos:ImagenesElementos.length
        });
        Selector.Circular=Canvas.CanvasBasico;
        Canvas.CanvasBasico.unshift(
            new CatalogoImagenes({
                Imagenes:ImagenesElementos,
                Canvas: Canvas.CanvasBasico.Canvas,
                Radio:Canvas.CanvasBasico.Sectores[0].R2
            })
        );
        if(ImagenesFondo.length)
        Canvas.CanvasBasico.unshift( new CatalogoImagenes({
                Imagenes:ImagenesFondo,
                Canvas: Canvas.CanvasBasico.Canvas,
                Radio:0,
                Rate:600,
                Animar:false
            })
        );
        if(ImagenesFrente.length)
        Canvas.CanvasBasico.push( new CatalogoImagenes({
                Imagenes:ImagenesFrente,
                Canvas: Canvas.CanvasBasico.Canvas,
                Radio:0,
                Rate:600,
                Animar:false
            })
        );
    	if(Selector.classList.contains('MostrarFps'))
    		Canvas.CanvasBasico.push(new MostrarFPS({Canvas:Canvas}));
        CargarCarrucelCircular.DibujarCuadro.push(Canvas);
    }
}
CargarCarrucelCircular.DibujarCuadro=[];
window.AnimarCuadro=function(){
    if(CargarCarrucelCircular.DibujarCuadro.length>0)
        CargarCarrucelCircular.DibujarCuadro.map(function(canrr,i){
            canrr.CanvasBasico.DibujarCuadro()
        });
    window.requestAnimationFrame(window.AnimarCuadro);
};
window.AnimarCuadro();


