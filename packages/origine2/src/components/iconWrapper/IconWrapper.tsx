interface IIconWrapperProps {
  src: any;
  size?: number;
  iconSize?: number;
}


export default function IconWrapper(props: IIconWrapperProps) {
  const { size = 16 } = props;
  const { iconSize = 16 } = props;
  return <div style={
    {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`
    }}>
    <img alt="icon" src={props.src} style={{
      width: `${iconSize}px`,
      height: `${iconSize}px`
    }} />
  </div>;
}
