interface UnderlineProps {
  className?: string
}

const Underline = ({ className }: UnderlineProps) => {
  return (
    <svg
      className={className}
      preserveAspectRatio="none"
      viewBox="0 0 100 10"
    >
      <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
    </svg>
  )
}

export default Underline