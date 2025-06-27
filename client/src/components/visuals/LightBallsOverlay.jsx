import { useEffect, useRef } from "react";
import "./LightBallsOverlay.css";

const BALL_COUNT = 12;
const BALL_SIZE = 8;

const random = (min, max) => {
  return Math.random() * (max - min) + min;
}

const LightBallsOverlay = () => {
  const ballsRef = useRef([]);

  useEffect(() => {
    let animationFrame;
    const balls = ballsRef.current.map((element) => ({
      element,
      x: random(0, 100),
      y: random(0, 100),
      dx: random(-0.015, 0.015),
      dy: random(-0.015, 0.015),
    }));

    function animate() {
      balls.forEach((ball) => {
        ball.x += ball.dx;
        ball.y += ball.dy;
        if (ball.x < 0 || ball.x > 100) ball.dx *= -1;
        if (ball.y < 0 || ball.y > 100) ball.dy *= -1;
        if (ball.element) {
          ball.element.style.left = `${ball.x}%`;
          ball.element.style.top = `${ball.y}%`;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="light-balls-overlay">
      {Array.from({ length: BALL_COUNT }).map((current, i) => (
        <div
          key={i}
          ref={element => ballsRef.current[i] = element}
          className="light-ball"
          style={{
            left: `${random(0, 100)}%`,
            top: `${random(0, 100)}%`,
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
        />
      ))}
    </div>
  );
};

export default LightBallsOverlay;