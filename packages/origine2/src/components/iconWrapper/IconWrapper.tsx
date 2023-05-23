interface IIconWrapperProps {
  src: any;
  size?: number;
  iconSize?: number;
}


export default function IconWrapper(props: IIconWrapperProps) {
  const { size = 16 } = props;
  return <div style={
    {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size
    }}>
    <img alt="icon" src={props.src} style={{
      width: props.iconSize,
      height: props.iconSize
    }} />
  </div>;
}
