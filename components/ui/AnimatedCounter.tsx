'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function AnimatedCounter({ value, duration = 1.5 }: { value: number, duration?: number }) {
  const [mounted, setMounted] = useState(false);
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });

  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
     
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      springValue.set(value);
    }
  }, [value, springValue, mounted]);

  if (!mounted) return <span>0</span>;

  return <motion.span>{displayValue}</motion.span>;
}
