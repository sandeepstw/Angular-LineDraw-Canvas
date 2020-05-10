import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { fromEvent } from "rxjs";
import { switchMap, takeUntil, pairwise } from "rxjs/operators";
import { forEach } from "@angular/router/src/utils/collection";

@Component({
  selector: "app-canvas",
  template: "<canvas #canvas></canvas>",

  styles: ["canvas { border: 1px solid #000; }"]
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild("canvas") public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;
  @Input() public x = 0;
  @Input() public y = 0;
   @Input() dwrawingCompleted  = 1;
  //@Input() public previous = [];
  @Input() public current = [];

  private cx: CanvasRenderingContext2D;
  private cx1: CanvasRenderingContext2D;
  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    this.cx = canvasEl.getContext("2d");
    this.cx1 = canvasEl.getContext("2d");

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = "round";
    this.cx.strokeStyle = "#000";
    this.cx1.lineWidth = 3;
    this.cx1.lineCap = "round";
    this.cx1.strokeStyle = "#000";

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, "mouseenter")
      .pipe(
        switchMap(e => {
   
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, "mousedown").pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            
            // this will trigger a 'mouseup' event
            //   takeUntil(fromEvent(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, "mouseleave")),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        }),
       
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
       
        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
         
        
        //this.previous.push(prevPos);
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.current.push(currentPos);
        // this method we'll implement soon to do the actual drawing
      if(this.dwrawingCompleted==1)
        this.drawOnCanvas(prevPos, currentPos);
      });
    fromEvent(canvasEl, "mouseenter")
      .pipe(
        switchMap(e => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, "mousemove").pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            //  takeUntil(fromEvent(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, "mouseleave")),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((resNew: [MouseEvent, MouseEvent]) => {
        const rectnew = canvasEl.getBoundingClientRect();

        const prePosNew = {
          x: resNew[0].clientX - rectnew.left,
          y: resNew[0].clientY - rectnew.top
        };
        const currentPosNew = {
          x: resNew[1].clientX - rectnew.left,
          y: resNew[1].clientY - rectnew.top
        };
       
        if (this.current.length > 0 && this.dwrawingCompleted==1) {
          console.log("I am called inside");
          this.cx.clearRect(0, 0, this.width, this.height);
          // drawline again
          this.cx.beginPath();
               // this is right  
          for(let i=1;i<this.current.length;i++)
          {
            this.cx.setLineDash([]);
             this.cx.moveTo(this.current[i-1].x, this.current[i-1].y); // from
            this.cx.lineTo(this.current[i].x, this.current[i].y);
          }
        this.cx.closePath();

        //  this.cx.setLineDash([5, 5]);
          //this.cx.beginPath();
          this.cx.strokeStyle='#cc0000';
          this.cx.moveTo(this.current[this.current.length-1].x, this.current[this.current.length-1].y);
          this.cx.lineTo(currentPosNew.x, currentPosNew.y);
          this.cx.stroke();
        }

       
        
       
      });
      fromEvent(canvasEl, "mouseenter")
      .pipe(
        switchMap(e => {
   
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, "mousedown")
           
          
                  }),
       
      ) .subscribe((res) => {
        console.log(res);
       let dwrawingCompleted=1;
        const rect = canvasEl.getBoundingClientRect();
      
        const firstPos = {
            
          x: res.clientX - rect.left,
        y: res.clientY - rect.top
        };
        
        if(this.current.length==0)
        {
          
         
           this.current.push(firstPos);
        }
        else{
          console.log("firstPos",firstPos);
          console.log("current",this.current[0]);
          let a = parseInt(this.current[0].x) - parseInt(firstPos.x.toString()) ;
          let b = parseInt(this.current[0].y) - parseInt(firstPos.y.toString());
          console.log("a",a);
          console.log("b",b);
        var dist = Math.sqrt( a*a + b*b );
          console.log("dist",dist);
         
          if(dist<10)
          {
            console.log("called");
              this.dwrawingCompleted=0;
          }
        }
      });
  }

 

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();

    if (prevPos) {
      this.x = currentPos.x;
      this.y = currentPos.y;
      this.cx.setLineDash([]);
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x , currentPos.y);
      this.cx.stroke();
    }
  }
}
