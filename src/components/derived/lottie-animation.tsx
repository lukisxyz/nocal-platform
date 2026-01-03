import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  loop?: boolean;
  className?: string;
  animationPath?: string;
}

export function LottieAnimation({
  loop = true,
  className = '',
  animationPath = '/lottie/login-animation.json'
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error(error));
  }, [animationPath]);

  if (!animationData) {
    return <div className={className}>Loading animation...</div>;
  }

  return <Lottie animationData={animationData} loop={loop} className={className} />;
}
