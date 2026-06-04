import { useCounterAnimation } from '../../hooks/useCounterAnimation';

const AnimatedCounter = ({ value = 0, duration = 1500, prefix = '', suffix = '', className = '' }) => {
  const count = useCounterAnimation(value, duration);
  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
