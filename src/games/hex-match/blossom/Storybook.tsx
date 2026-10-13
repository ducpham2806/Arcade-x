import React, { useState } from "react";
import { INTRO_EN, MID_EN, VICTORY_EN } from "./story-en";
import { Localized } from "./i18n";
import { asset } from "./assets";
import { MID_STORIES, VICTORY_STORIES, StoryKind } from "./story-scenes";
import { CHAPTERS } from "./levels";
const STORIES = [
  [
    [
      "Một khu vườn im lặng",
      "Mia",
      "Hôm qua nơi này còn rực rỡ. Vì sao hôm nay hoa đều cúi đầu?",
    ],
    [
      "Lời hứa của Bibi",
      "Bibi",
      "Bụi Xám đang phủ kín Cây Đời. Mỗi bông hoa thức giấc sẽ giúp chúng ta tìm một hạt giống.",
    ],
    [
      "Bước đầu của hành trình",
      "Mia",
      "Mình sẽ bắt đầu từ luống hoa nhỏ này. Bibi, cùng làm khu vườn nở lại nhé!",
    ],
  ],
  [
    [
      "Những quả chín biến mất",
      "Mia",
      "Cành cây trĩu quả, nhưng ai đã mang sắc màu của chúng đi?",
    ],
    [
      "Đôi cánh trên vườn quả",
      "Bibi",
      "Quạ Tham Ăn giữ hạt Cam. Hãy dọn cỏ để mở lối đến tổ của nó.",
    ],
    [
      "Chia sẻ mùa ngọt",
      "Mia",
      "Quả chín dành cho mọi người. Mình sẽ mang màu cam ấm áp trở lại.",
    ],
  ],
  [
    [
      "Cối xay ngừng quay",
      "Mia",
      "Gió vẫn thổi, sao đồng cỏ lại yên lặng đến vậy?",
    ],
    [
      "Một người bạn nhỏ",
      "Pip",
      "Bụi Xám mắc trong những cánh quạt. Tôi biết một lối đi giữa các tảng đá!",
    ],
    [
      "Để gió trở về",
      "Bibi",
      "Giải phóng những hạt giống. Khi cối xay quay lại, hạt Vàng sẽ thức giấc.",
    ],
  ],
  [
    [
      "Biển không còn hát",
      "Mia",
      "Sóng vẫn chạm bờ, nhưng những bông hoa biển đã mất màu.",
    ],
    [
      "Chiếc càng giấu bí mật",
      "Bibi",
      "Cua Khổng Lồ đang giữ hạt Xanh Biển. Dây leo đã bò kín bãi cát.",
    ],
    [
      "Một khoảng trời dịu lại",
      "Mia",
      "Có lẽ Bụi Xám sinh ra từ nỗi buồn. Mình sẽ mang chút niềm vui đến đây.",
    ],
  ],
  [
    [
      "Ánh sáng dưới tán nấm",
      "Mia",
      "Những đốm màu nhỏ đang gọi mình vào rừng.",
    ],
    [
      "Giải cứu Thỏ Bông",
      "Thỏ",
      "Bạn của tôi bị nhốt trong kén. Xin giúp chúng tôi tìm đường về!",
    ],
    [
      "Không ai bị bỏ lại",
      "Bibi",
      "Cứu từng người bạn, rồi cùng tìm hạt Tím giữa rừng nấm.",
    ],
  ],
  [
    [
      "Giữa biển cát",
      "Mia",
      "Cát trải dài đến tận chân trời. Mình đã đi đúng hướng chưa?",
    ],
    [
      "Ánh vàng dẫn lối",
      "Bibi",
      "Đừng sợ. Những bông xương rồng sẽ chỉ đường; hãy coi chừng bom của Bọ Cạp.",
    ],
    [
      "Một bông hoa bền bỉ",
      "Mia",
      "Ngay giữa sa mạc, hoa vẫn nở. Hạt Cam Đất cũng đang chờ chúng ta.",
    ],
  ],
  [
    [
      "Ký ức trong băng",
      "Mia",
      "Mọi thứ đã đóng băng, kể cả những bông hoa đang hé nở.",
    ],
    [
      "Người làm vườn năm xưa",
      "Bibi",
      "Nữ Hoàng từng chăm sóc nơi này. Vì sợ mất đi vẻ đẹp, bà giữ nó trong băng.",
    ],
    [
      "Sự sống cần đổi thay",
      "Mia",
      "Hoa cần lớn lên, rồi nhường chỗ cho mùa mới. Hãy giải phóng hạt Băng.",
    ],
  ],
  [
    [
      "Một mặt hồ mờ sương",
      "Mia",
      "Dưới màn sương, mình nghe thấy tiếng những bông sen.",
    ],
    [
      "Đôi mắt của Cú Đêm",
      "Cú",
      "Sương che những ký ức cũ. Tôi sẽ giúp các bạn nhìn thấy điều bị lãng quên.",
    ],
    [
      "Đón một ngày mới",
      "Bibi",
      "Hạt Sen mang màu của hoàng hôn. Cả ngày cũ lẫn ngày mới đều đáng được yêu.",
    ],
  ],
  [
    [
      "Những đốm sáng cuối cùng",
      "Mia",
      "Đom đóm vẫn giữ một chút ánh sáng giữa thung lũng tối.",
    ],
    [
      "Sợi tơ níu mùa cũ",
      "Bibi",
      "Nhện Đêm giữ mọi thứ trong kén. Nó cũng sợ khu vườn thay đổi.",
    ],
    [
      "Mở đường cho ánh sáng",
      "Mia",
      "Mình sẽ mở từng chiếc kén. Hạt Đom Đóm sẽ dẫn đường đến cung điện.",
    ],
  ],
  [
    [
      "Trước cánh cổng vàng",
      "Rùa",
      "Các con đã đi rất xa. Mỗi hạt giống là một điều khu vườn đã học được.",
    ],
    [
      "Lời của Nữ Hoàng",
      "Mia",
      "Chúng cháu không đến để lấy mất khu vườn. Chúng cháu muốn nó được sống.",
    ],
    [
      "Khi Bụi Xám hóa phấn hoa",
      "Bibi",
      "Mang mười hạt giống đến Cây Đời. Một mùa mới sẽ bắt đầu từ lòng can đảm của chúng ta.",
    ],
  ],
];
export function Storybook({
  chapter,
  kind = "intro",
  language = "vi",
  availableKinds = [kind],
  onKindChange,
  onClose,
}: {
  chapter: number;
  kind?: StoryKind;
  language?: "vi" | "en";
  availableKinds?: StoryKind[];
  onKindChange?: (kind: StoryKind) => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const vietnamesePanels =
    kind === "mid"
      ? MID_STORIES[chapter - 1]
      : kind === "victory"
        ? VICTORY_STORIES[chapter - 1]
        : STORIES[chapter - 1];
  const panels =
    language === "en"
      ? (kind === "mid" ? MID_EN : kind === "victory" ? VICTORY_EN : INTRO_EN)[
          chapter - 1
        ]
      : vietnamesePanels;
  return (
    <Localized language={language}>
      <div className="bb-shade">
        <section
          className="bb-storybook"
          role="dialog"
          aria-modal="true"
          aria-label={`Chương ${chapter} · ${CHAPTERS[chapter - 1]}`}
        >
          <header>
            <div>
              <p className="bb-kicker">
                {kind === "mid"
                  ? "CHUYỆN GIỮA CHƯƠNG"
                  : kind === "victory"
                    ? "HẠT GIỐNG ĐÃ THỨC GIẤC"
                    : "NHẬT KÝ MIA & BIBI"}{" "}
                · CHƯƠNG {String(chapter).padStart(2, "0")}
              </p>
              <h2>{CHAPTERS[chapter - 1]}</h2>
              {onKindChange && availableKinds.length > 1 && (
                <nav className="bb-story-kinds" aria-label="Cảnh truyện">
                  {availableKinds.map((k) => (
                    <button
                      key={k}
                      aria-pressed={kind === k}
                      onClick={() => onKindChange(k)}
                    >
                      {k === "intro"
                        ? "Mở đầu"
                        : k === "mid"
                          ? "Giữa chương"
                          : "Sau boss"}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            <button onClick={onClose}>Bỏ qua</button>
          </header>
          <div className="bb-story-spread">
            {panels.map(([title, speaker, text], i) => (
              <article key={i} className={page === i ? "current" : ""}>
                <div className="bb-story-art">
                  <img
                    src={asset(
                      `png/comics/comic_c${String(chapter).padStart(2, "0")}_p${i + 1}.png`,
                    )}
                    alt={title}
                  />
                  <span>0{i + 1}</span>
                </div>
                <div className="bb-story-copy">
                  <p className="bb-kicker">{speaker}</p>
                  <h3>{title}</h3>
                  <p>“{text}”</p>
                </div>
              </article>
            ))}
          </div>
          <footer>
            <button
              className="bb-story-prev"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Trang trước
            </button>
            <div className="bb-story-dots">
              {[0, 1, 2].map((i) => (
                <button
                  aria-label={`Trang ${i + 1}`}
                  className={page === i ? "active" : ""}
                  key={i}
                  onClick={() => setPage(i)}
                />
              ))}
            </div>
            <button
              className="bb-primary bb-story-next"
              onClick={() => (page < 2 ? setPage(page + 1) : onClose())}
            >
              {page < 2 ? "Trang tiếp →" : "Tiếp tục hành trình"}
            </button>
            <button className="bb-primary bb-story-desktop" onClick={onClose}>
              Tiếp tục hành trình
            </button>
          </footer>
        </section>
      </div>
    </Localized>
  );
}
