type Props = {
  avatarPath?: string | null;
  nickname: string;
  color?: string;
  size?: number;
};

export function Avatar({ avatarPath, nickname, color = "#7c5cff", size = 48 }: Props) {
  const style = { width: size, height: size };
  if (avatarPath) {
    return (
      <img
        src={`/api/avatar/${avatarPath}`}
        alt={nickname}
        style={style}
        className="pixel-border object-cover shrink-0"
      />
    );
  }
  return (
    <div
      style={{ ...style, backgroundColor: color }}
      className="pixel-border shrink-0 flex items-center justify-center font-display text-bg"
    >
      <span style={{ fontSize: size * 0.4 }}>{nickname.charAt(0).toUpperCase()}</span>
    </div>
  );
}
