    import { useState, useRef, useEffect } from "react";
    import { swatches } from "../constant";
    import axios from "axios";
    import Draggable from "react-draggable"

    function Index() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color,setColor] = useState("rgb(255,255,255)");
    const[dictOfVars,setdictOfvars] = useState({});
    const[latexPosition,setLatexPosition] = useState({x:10,y:200});
    const[latexExpression,setLatexExpression] = useState([])
    const[result,setResult] = useState();
    const [reset,setReset] = useState(false);
    const [isLoading,setisLoading] = useState(false);


    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);
    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setdictOfvars({});
            setReset(false);
        }
    }, [reset]);

    const renderLatexToCanvas = (expression, answer) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - canvas.offsetTop;
            ctx.lineCap = "round";
            ctx.lineWidth = 3;  
        }
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
        script.async = true;
        document.head.appendChild(script);
        script.onload = ()=>{
            window.MathJax.Hub.Config({
                tex2jax : {
                    inlineMath:[['$', '$'], ['\\(', '\\)']]
                }
            })
        }
        return ()=>{
            document.head.removeChild(script);
        }
    }, []);

    function startDrawing(e) {
        const canvas = canvasRef.current;
        if (canvas) {
        canvas.style.background = "black";
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            setIsDrawing(true);
        }
        }
    }
    function stopDrawing() {
        setIsDrawing(false);
    }
    function draw(e) {
        if (!isDrawing) {
        return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        }
    }
    function clearCanvas(){
        const canvas = canvasRef.current;
        if(canvas){
            const ctx = canvas.getContext("2d");
            if(ctx){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setLatexExpression([]);
            }
        }
    }

    async function sendData() {
        setisLoading(true);
        const canvas = canvasRef.current;
        if(canvas){
            const res = await axios.post('http://localhost:3000/calculate', {
                image: canvas.toDataURL("image/png"),
                dict_of_vars: dictOfVars,
            });
            const result = res.data;
            console.log("response", result);
            result.data.forEach(data => {
                if(data.assign === true){
                    setdictOfvars({...dictOfVars,[data.expr]: data.result})
                }
            });
            const ctx = canvas.getContext('2d');
            if(ctx){
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const i = (y * canvas.width + x) * 4;
                            if (imageData.data[i + 3] > 0) { 
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                setLatexPosition({ x: centerX, y: centerY });
                result.data.forEach((data) => {
                    setTimeout(() => {
                        setResult({
                            expression: data.expr,
                            answer: data.result
                            });
                        }, 0);
                    });
            }
            setisLoading(false)
        }

    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 justify-center p-4">
                <button
                    className="text-white font-bold z-20 bg-red-500 rounded px-3 py-1 sm:px-4 sm:py-2 hover:scale-95 transition-transform"
                    onClick={clearCanvas}
                >
                    Reset
                </button>
                
                <div className="flex gap-2 p-2 justify-center">
                    {swatches.map((c, index) => (
                        <button
                            key={index}
                            onClick={() => setColor(c)}
                            style={{ background: c }}
                            className="w-8 h-8 rounded-full z-20 hover:scale-110 transition-transform"
                        ></button>
                    ))}
                </div>
                
                <button
                    className="text-white font-bold z-20 bg-green-500 rounded px-3 py-1 sm:px-4 sm:py-2 hover:scale-95 transition-transform"
                    onClick={sendData}
                >
                    Ask
                </button>
            </div>
                    {isLoading && (
                    <div className="flex items-center justify-center">
                        <p className="text-white font-bold text-xl z-20">Thinking...</p>
                    </div>
                    )}
                <canvas
                className="w-full h-full absolute top-0 left-0 bg-black"
                ref={canvasRef}
                onMouseMove={draw}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                />
                {latexExpression && latexExpression.map((latex, index) => (
                <Draggable
                    key={index}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                >
                    <div className="absolute p-2 text-white rounded shadow-md">
                        <div className="latex-content">{latex}</div>
                    </div>
                </Draggable>
            ))}
        </div>
    );
}

export default Index;
