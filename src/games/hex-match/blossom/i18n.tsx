import React from "react";
const WORDS: Record<string, string> = {
  "Đang hoàn tất hiệu ứng và thưởng lượt dư…": "Finishing effects and remaining move bonus…",
  "Đang diễn hoạt…": "Resolving the board…",
  "Điểm thưởng": "Bonus score",
  "Tổng Xu nhận được": "Total coins earned",
  "Đã gồm": "Includes",
  "Xu từ lượt dư.": "coins from remaining moves.",
  "Hỗ trợ chưa dùng đã được hoàn trả. Không mất mạng khi chơi lại.": "Unused tools have been returned. Retrying costs no lives.",
  "Thử trên bàn": "Try on the board",
  "Xem lại": "Read again",
  "Bàn đang tạm khóa": "Board paused",
  "BIBI HƯỚNG DẪN": "BIBI’S TUTORIAL",
  "bước còn lại · Bàn đang tạm khóa": "steps left · Board paused",
  "Thực hành có hướng dẫn": "Guided practice",
  "Công cụ trong ván": "In-game tools",
  "Hủy chọn": "Cancel selection",
  "Cần hai special cạnh nhau": "Two adjacent specials required",
  "Ghép hai special cạnh nhau": "Combine two adjacent specials",
  "Chọn special thứ nhất · ghép đôi dùng 1 lượt.": "Choose the first special · combining costs 1 move.",
  "Chọn special thứ hai ở cạnh ô đang sáng.": "Choose the second special next to the highlighted one.",
  "Mỗi bông hoa": "Every flower",
  "là một lời hứa.": "is a promise.",
  Khó: "Difficulty",
  "Nhạc nền": "Background music",
  "Âm lượng nhạc": "Music volume",
  "Trộn miễn phí để mở lại đường rơi hạt.":
    "Free shuffle to reopen a seed path.",
  "Bàn đã được trộn miễn phí.": "The board was shuffled for free.",
  "Cảnh truyện": "Story scenes",
  "Mở đầu": "Introduction",
  "Giữa chương": "Interlude",
  "Sau boss": "After the boss",
  "Hướng dẫn cơ chế mới": "New mechanic tutorial",
  "Xem thưởng lượt dư": "See move bonus",
  Còn: "Remaining",
  "lượt · tiếp theo là thưởng điểm và Xu.":
    "moves · next comes the score and coin bonus.",
  "lượt dư → nổ special +": "spare moves → special blasts +",
  "điểm cố định": "fixed points",
  "Xu từ lượt dư": "coins from spare moves",
  Thỏ: "Bunny",
  Cú: "Owl",
  Rùa: "Turtle",
  "Ngôn ngữ điều hướng": "Language",
  "Hoa bóng · bàn tối": "Glossy flowers · dark board",
  "Chibi · bàn sáng": "Chibi · light board",
  "Âm lượng": "Volume",
  "CHƠI THEO CÁCH CỦA BẠN": "PLAY YOUR WAY",
  "Hiệu ứng âm thanh bật": "Sound effects on",
  TẮT: "OFF",

  "Đã hoàn thành mục tiêu!": "Goal completed!",
  "Khu vườn đã nở hoa!": "The garden is blooming!",
  "Xem tổng kết": "See results",
  "Đang nở hoa…": "Flowers are blooming…",
  "Thưởng lượt còn lại": "Remaining move bonus",
  "Ván chơi đã kết thúc": "The round has ended",
  "Hoàn thành mục tiêu": "Goal completed",
  "Lý do kết thúc ván": "Why the round ended",
  "Bạn đã hoàn thành tất cả mục tiêu của màn này.":
    "You completed every goal in this level.",
  "Bạn có thể thử lại": "You can try again",
  "KHU VƯỜN ĐÃ THỨC GIẤC": "THE GARDEN HAS AWAKENED",
  "BẠN CÓ THỂ THỬ LẠI": "YOU CAN TRY AGAIN",
  "Đã đánh bại boss": "Boss defeated",
  "Boss còn": "Boss HP remaining:",
  "Hãy làm nở nhóm hoa đầu tiên": "Make your first flowers bloom",
  "Mục tiêu điểm": "Score goal",
  "Mục tiêu mới": "New goal",
  "Hướng dẫn": "Tutorial",
  "Cổng dịch chuyển": "Portals",
  "Hạt giống cần rơi xuống đáy.": "Seeds must reach the bottom.",
  "Bibi hướng dẫn": "Bibi explains",
  "Đã hiểu": "Got it",
  "Bỏ qua": "Skip",
  "Tiếp tục hành trình": "Continue the journey",
  "Trang tiếp →": "Next page →",
  "← Trang trước": "← Previous page",
  "NHẬT KÝ MIA & BIBI": "MIA & BIBI’S JOURNAL",
  "CHUYỆN GIỮA CHƯƠNG": "CHAPTER INTERLUDE",
  "HẠT GIỐNG ĐÃ THỨC GIẤC": "THE SEED HAS AWAKENED",
  "Bạn đồng hành nghỉ ở màn boss để giữ thử thách.":
    "Companions rest during boss levels to keep the challenge.",
  "Bạn đồng hành": "Companion",
  "Chuẩn bị vật phẩm": "Prepare items",
  "Tối đa 3 loại khởi đầu. Mang hỗ trợ trước ván; phần chưa dùng được hoàn trả.":
    "Choose up to 3 starting item types. Unused support items are returned.",
  "Ghép đôi": "Combine",
  "Gợi ý": "Hint",
  "Xua sương": "Clear fog",
  "Lần chạm": "Taps",
  "lần chạm": "taps",
  Điểm: "Score",
  điểm: "points",
  Lượt: "Moves",
  lượt: "moves",
  Giây: "Seconds",
  giây: "seconds",
  "Thu hoa": "Collect flowers",
  "Thả hạt": "Drop seeds",
  "Cứu bạn": "Rescue friends",
  "Cỏ dại": "Weeds",
  Đá: "Rocks",
  Kén: "Cocoons",
  Băng: "Ice",
  "Dây leo": "Vines",
  Sâu: "Bugs",
  "Bom giờ": "Timed bombs",
  "Mật ong": "Honey",
  Sương: "Fog",
  "Chuỗi chạm": "Tap streak",
  "Hộp quà": "Gift boxes",
  "Hoa bóng": "Glossy flowers",
  Bật: "On",
  Tắt: "Off",
  "Âm thanh": "Sound",
  Rung: "Haptics",
  "Giảm chuyển động": "Reduce motion",
  "Ngôn ngữ": "Language",
  "Cỡ chữ": "Text size",
  "Nhãn màu": "Color labels",
  "Phong cách": "Style",
  Mùa: "Season",
  "Cài đặt": "Settings",
  "Chơi lại": "Retry",
  "Màn tiếp": "Next level",
  "Về bản đồ": "Back to map",
  "Bắt đầu": "Start",
  CHƯƠNG: "CHAPTER",
  Chương: "Chapter",
  MÀN: "LEVEL",
  Màn: "Level",
  Hàng: "Row",
  cột: "column",
  hoa: "flowers",
  "hạt giống": "seed",
  "sương mù": "fog",
  "Bản đồ hành trình": "Journey map",
  "Vườn của bạn": "Your garden",
  "Thử thách": "Challenge",
  "Thử thách chung trong ngày": "Shared daily challenge",
  "Không gửi dữ liệu lên server": "No data is sent to a server",
  "BẢN DUYỆT OFFLINE": "OFFLINE REVIEW",
  "Mở toàn bộ màn để kiểm tra": "All levels unlocked for testing",
  "Vườn Hoa Xuân": "Spring Flower Garden",
  "Vườn Cây Ăn Quả": "Orchard",
  "Đồng Cỏ & Cối Xay": "Meadow & Windmill",
  "Bãi Biển Nhiệt Đới": "Tropical Beach",
  "Rừng Nấm Kỳ Diệu": "Enchanted Mushroom Forest",
  "Sa Mạc Xương Rồng": "Cactus Desert",
  "Núi Tuyết Hoa Băng": "Frostflower Mountain",
  "Đầm Sen Hoàng Hôn": "Sunset Lotus Marsh",
  "Thung Lũng Đom Đóm": "Firefly Valley",
  "Cung Điện Hoa Vàng": "Golden Flower Palace",
  "Câu chuyện chương": "Chapter story",
  Nắng: "Sun",
  ONG: "BEE",
  BOM: "BOMB",
  MÀU: "COLOR",
  NẮNG: "SUN",
  "Hồ sơ": "Profile",
  Mua: "Buy",
  Xu: "Coins",
  "Tạm dừng": "Paused",
  "Tiếp tục": "Continue",
  Đóng: "Close",
  "Đang chơi": "Playing",
  "Đã hết thời gian.": "Time has run out.",
  "Đã hết lượt.": "No moves remain.",
  "Bom hẹn giờ đã hết lượt.": "A timed bomb ran out of turns.",
};
const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(
  Object.keys(WORDS)
    .sort((a, b) => b.length - a.length)
    .map(escaped)
    .join("|"),
  "g",
);
export function translate(text: string, language: "vi" | "en") {
  if (language === "vi") return text;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (WORDS[cleaned]) return text.replace(text.trim(), WORDS[cleaned]);
  return /\d/.test(text) || (cleaned.length <= 45 && !/[.!?]/.test(cleaned))
    ? text.replace(pattern, (word) => WORDS[word])
    : text;
}
export function localize(
  node: React.ReactNode,
  language: "vi" | "en",
): React.ReactNode {
  if (language === "vi") return node;
  if (typeof node === "string") return translate(node, language);
  if (Array.isArray(node))
    return node.map((child) => localize(child, language));
  if (!React.isValidElement(node)) return node;
  const element = node as React.ReactElement<Record<string, unknown>>;
  const props: Record<string, unknown> = {};
  for (const key of ["aria-label", "title", "alt", "placeholder"])
    if (typeof element.props[key] === "string")
      props[key] = translate(element.props[key] as string, language);
  if (element.props.children !== undefined)
    props.children = localize(
      element.props.children as React.ReactNode,
      language,
    );
  return React.cloneElement(element, props);
}
export function Localized({
  language,
  children,
}: {
  language: "vi" | "en";
  children: React.ReactNode;
}) {
  return <>{localize(children, language)}</>;
}
