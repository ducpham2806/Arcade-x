export interface WordDefinition {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn: string;
  example: string;
  exampleVi: string;
}

export const DICTIONARY: Record<string, WordDefinition> = {
  // Colors
  RED: {
    word: 'RED',
    phonetic: '/red/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu đỏ; màu sắc của máu hoặc quả dâu tây chín.',
    meaningEn: 'Of a color at the end of the spectrum next to orange, resembling blood.',
    example: 'She wore a bright red dress to the ceremony.',
    exampleVi: 'Cô ấy mặc một chiếc váy đỏ tươi tới buổi lễ.'
  },
  BLUE: {
    word: 'BLUE',
    phonetic: '/bluː/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh da trời, màu lam.',
    meaningEn: 'Having the color of the clear sky on a sunny day.',
    example: 'The ocean looked deep blue under the afternoon sun.',
    exampleVi: 'Đại dương trông có màu xanh thẳm dưới ánh nắng chiều.'
  },
  GREEN: {
    word: 'GREEN',
    phonetic: '/ɡriːn/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh lá cây; đại diện cho thiên nhiên, sự sống tươi tốt.',
    meaningEn: 'Of the color between blue and yellow in the spectrum; colored like grass.',
    example: 'The hills were covered with fresh green grass.',
    exampleVi: 'Những ngọn đồi được bao phủ bởi thảm cỏ xanh tươi.'
  },
  YELLOW: {
    word: 'YELLOW',
    phonetic: '/ˈjel.oʊ/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu vàng rực rỡ như ánh nắng mặt trời.',
    meaningEn: 'Of the color between green and orange in the spectrum, like ripe lemons.',
    example: 'Sunflowers have vibrant yellow petals.',
    exampleVi: 'Hoa hướng dương có những cánh hoa màu vàng rực rỡ.'
  },
  PURPLE: {
    word: 'PURPLE',
    phonetic: '/ˈpɝː.pəl/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu tím; màu kết hợp giữa đỏ và xanh lam, tượng trưng cho sự quý tộc.',
    meaningEn: 'A color intermediate between red and blue.',
    example: 'The king wore a luxurious purple cloak.',
    exampleVi: 'Vị vua khoác trên mình chiếc áo choàng màu tím sang trọng.'
  },
  ORANGE: {
    word: 'ORANGE',
    phonetic: '/ˈɔːr.ɪndʒ/',
    partOfSpeech: 'Danh từ / Tính từ',
    meaningVi: 'Màu cam hoặc quả cam mọng nước.',
    meaningEn: 'A bright reddish-yellow color, or a round citrus fruit.',
    example: 'The sunset painted the sky in vivid shades of orange.',
    exampleVi: 'Hoàng hôn nhuộm bầu trời bằng những sắc cam rực rỡ.'
  },
  BLACK: {
    word: 'BLACK',
    phonetic: '/blæk/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu đen; màu tối nhất, hấp thụ hoàn toàn ánh sáng.',
    meaningEn: 'Of the very darkest color owing to the absence or absorption of light.',
    example: 'He wore a smart black suit.',
    exampleVi: 'Anh ấy mặc một bộ com-lê đen lịch lãm.'
  },
  WHITE: {
    word: 'WHITE',
    phonetic: '/waɪt/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu trắng; màu của tuyết hoặc sữa tinh khiết.',
    meaningEn: 'Of the color of milk or fresh snow, reflecting all light.',
    example: 'Snow covered the mountains in pure white.',
    exampleVi: 'Tuyết bao phủ các ngọn núi trong sắc trắng tinh khôi.'
  },
  CYAN: {
    word: 'CYAN',
    phonetic: '/ˈsaɪ.æn/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh lơ, xanh cánh chả.',
    meaningEn: 'A greenish-blue color, which is one of the primary subtractive colors.',
    example: 'The printer uses cyan, magenta, yellow, and black ink.',
    exampleVi: 'Máy in sử dụng mực màu xanh lơ, đỏ cánh sen, vàng và đen.'
  },
  MAGENTA: {
    word: 'MAGENTA',
    phonetic: '/məˈdʒen.tə/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu đỏ tím cánh sen rực rỡ.',
    meaningEn: 'A light purplish-red color.',
    example: 'Bright magenta orchids bloomed in the garden.',
    exampleVi: 'Những bông hoa lan tím cánh sen rực rỡ nở rộ trong vườn.'
  },
  TEAL: {
    word: 'TEAL',
    phonetic: '/tiːl/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh mòng két, xanh lục lam đậm.',
    meaningEn: 'A dark greenish-blue color.',
    example: 'The bedroom walls were painted a calming teal.',
    exampleVi: 'Những bức tường phòng ngủ được sơn màu xanh mòng két êm dịu.'
  },
  INDIGO: {
    word: 'INDIGO',
    phonetic: '/ˈɪn.dɪ.ɡoʊ/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu chàm; màu sắc giữa xanh lam và tím trong dải cầu vồng.',
    meaningEn: 'A dark blue color between blue and violet.',
    example: 'The evening sky transitioned from gold to deep indigo.',
    exampleVi: 'Bầu trời chiều chuyển dần từ ánh vàng sang sắc chàm huyền ảo.'
  },
  MAROON: {
    word: 'MAROON',
    phonetic: '/məˈruːn/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu nâu đỏ sẫm, màu hạt dẻ đậm.',
    meaningEn: 'A dark brownish-red color.',
    example: 'The university flag proudly displayed maroon and gold.',
    exampleVi: 'Lá cờ của trường đại học tự hào mang sắc nâu đỏ và vàng.'
  },
  NAVY: {
    word: 'NAVY',
    phonetic: '/ˈneɪ.vi/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh tím than, xanh hải quân.',
    meaningEn: 'A very dark shade of blue, traditionally worn by naval officers.',
    example: 'She chose a classic navy blazer for the interview.',
    exampleVi: 'Cô chọn một chiếc áo vest xanh tím than cổ điển cho buổi phỏng vấn.'
  },
  OLIVE: {
    word: 'OLIVE',
    phonetic: '/ˈɑː.lɪv/',
    partOfSpeech: 'Tính từ / Danh từ',
    meaningVi: 'Màu xanh ô-liu; màu vàng ánh xanh lá đậm.',
    meaningEn: 'A dark yellowish-green color like that of unripe olives.',
    example: 'He wore an olive jacket while hiking.',
    exampleVi: 'Anh ấy mặc chiếc áo khoác màu xanh ô-liu khi đi dã ngoại.'
  },
  SILVER: {
    word: 'SILVER',
    phonetic: '/ˈsɪl.vɚ/',
    partOfSpeech: 'Danh từ / Tính từ',
    meaningVi: 'Kim loại bạc hoặc màu xám ánh kim loại lấp lánh.',
    meaningEn: 'A precious shiny grayish-white metal, or its gleaming color.',
    example: 'The athlete proudly accepted the silver medal.',
    exampleVi: 'Vận động viên tự hào đón nhận tấm huy chương bạc.'
  },

  // Animals
  DOG: {
    word: 'DOG',
    phonetic: '/dɔːɡ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con chó; loài thú bốn chân trung thành với con người.',
    meaningEn: 'A domesticated carnivorous mammal widely kept as a pet or companion.',
    example: 'The golden retriever is a very friendly dog.',
    exampleVi: 'Chó Golden Retriever là một loài chó rất thân thiện.'
  },
  CAT: {
    word: 'CAT',
    phonetic: '/kæt/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con mèo; loài động vật nuôi nhỏ nhắn, nhanh nhẹn.',
    meaningEn: 'A small domesticated carnivorous mammal with soft fur and sharp claws.',
    example: 'The cat curled up comfortably on the sofa.',
    exampleVi: 'Chú mèo cuộn tròn thoải mái trên ghế sofa.'
  },
  BIRD: {
    word: 'BIRD',
    phonetic: '/bɝːd/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con chim; loài động vật có lông vũ và cánh biết bay.',
    meaningEn: 'A warm-blooded egg-laying vertebrate with feathers, wings, and a beak.',
    example: 'A small blue bird was singing on the tree branch.',
    exampleVi: 'Một chú chim nhỏ màu xanh đang hót trên cành cây.'
  },
  FISH: {
    word: 'FISH',
    phonetic: '/fɪʃ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con cá; loài động vật sống dưới nước thở bằng mang.',
    meaningEn: 'A limbless cold-blooded vertebrate animal with gills and fins living in water.',
    example: 'Colorful tropical fish swam among the coral reefs.',
    exampleVi: 'Những chú cá nhiệt đới nhiều màu sắc bơi lượn giữa các rạn san hô.'
  },
  LION: {
    word: 'LION',
    phonetic: '/ˈlaɪ.ən/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Sư tử; chúa sơn lâm thuộc họ mèo lớn sinh sống ở thảo nguyên.',
    meaningEn: 'A large tawny-colored cat that lives in prides, native to Africa and India.',
    example: 'The lion roared across the vast African savanna.',
    exampleVi: 'Chú sư tử gầm vang trên khắp thảo nguyên châu Phi rộng lớn.'
  },
  TIGER: {
    word: 'TIGER',
    phonetic: '/ˈtaɪ.ɡɚ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con hổ; loài thú ăn thịt lớn nhất họ mèo có sọc vằn đặc trưng.',
    meaningEn: 'A very large solitary cat with a yellow-brown coat striped with black.',
    example: 'The Bengal tiger moved silently through the jungle.',
    exampleVi: 'Chú hổ Bengal di chuyển êm ái xuyên qua cánh rừng rậm.'
  },
  BEAR: {
    word: 'BEAR',
    phonetic: '/ber/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con gấu; loài thú lớn có bộ lông dày và móng vuốt khỏe.',
    meaningEn: 'A large, heavy mammal that walks on the soles of its feet, with thick fur.',
    example: 'The brown bear caught fresh salmon from the river.',
    exampleVi: 'Chú gấu nâu bắt cá hồi tươi ngon từ dòng sông.'
  },
  WOLF: {
    word: 'WOLF',
    phonetic: '/wʊlf/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con sói; loài động vật hoang dã sống và săn mồi theo bầy.',
    meaningEn: 'A wild carnivorous mammal of the dog family, living and hunting in packs.',
    example: 'The wolf howled under the bright full moon.',
    exampleVi: 'Con sói hú vang dưới ánh trăng tròn vằng vặc.'
  },
  FOX: {
    word: 'FOX',
    phonetic: '/fɑːks/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con cáo; loài thú nhỏ tinh ranh với chiếc đuôi xù.',
    meaningEn: 'A carnivorous mammal of the dog family with a pointed muzzle and bushy tail.',
    example: 'The red fox dashed swiftly across the snowy field.',
    exampleVi: 'Con cáo đỏ lao vút qua cánh đồng tuyết trắng.'
  },
  DEER: {
    word: 'DEER',
    phonetic: '/dɪr/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con hươu, con nai; loài thú ăn cỏ có gạc phân nhánh ở con đực.',
    meaningEn: 'A hoofed grazing or browsing animal, with branched bony antlers in males.',
    example: 'A gentle deer grazed peacefully near the forest edge.',
    exampleVi: 'Chú hươu hiền lành đang gặm cỏ thanh bình gần bìa rừng.'
  },
  RABBIT: {
    word: 'RABBIT',
    phonetic: '/ˈræb.ɪt/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con thỏ; loài thú có đôi tai dài và hai răng cửa to.',
    meaningEn: 'A burrowing, gregarious plant-eating mammal with long ears and long hind legs.',
    example: 'The fluffy white rabbit hopped across the lawn.',
    exampleVi: 'Chú thỏ trắng lông xù nhảy nhót qua bãi cỏ.'
  },
  HORSE: {
    word: 'HORSE',
    phonetic: '/hɔːrs/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Con ngựa; loài thú móng guốc chạy nhanh dùng để cưỡi hoặc kéo xe.',
    meaningEn: 'A large plant-eating domesticated mammal with solid hooves and flowing mane.',
    example: 'The black horse galloped majestically across the open plain.',
    exampleVi: 'Chú ngựa đen phi nước đại đầy kiêu hãnh trên bình nguyên bao la.'
  },
  EAGLE: {
    word: 'EAGLE',
    phonetic: '/ˈiː.ɡəl/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Đại bàng; loài chim săn mồi to lớn với tầm nhìn tinh tường.',
    meaningEn: 'A large bird of prey with a massive hooked bill and keen long-range vision.',
    example: 'The eagle soared effortlessly above the mountain peaks.',
    exampleVi: 'Đại bàng lượn nhẹ nhàng trên những đỉnh núi cao vút.'
  },

  // Fruits
  APPLE: {
    word: 'APPLE',
    phonetic: '/ˈæp.əl/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả táo; loại trái cây giòn ngọt, giàu dinh dưỡng và vitamin.',
    meaningEn: 'The round fruit of a tree of the rose family, typically thin red or green skin.',
    example: 'An apple a day keeps the doctor away.',
    exampleVi: 'Mỗi ngày ăn một quả táo giúp cơ thể khỏe mạnh.'
  },
  BANANA: {
    word: 'BANANA',
    phonetic: '/bəˈnæn.ə/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả chuối; loại quả nhiệt đới thuôn dài có vỏ vàng khi chín.',
    meaningEn: 'A long curved fruit which grows in clusters and has soft pulpy flesh.',
    example: 'Bananas are rich in potassium and great for energy.',
    exampleVi: 'Chuối rất giàu kali và rất tốt để bổ sung năng lượng.'
  },
  MANGO: {
    word: 'MANGO',
    phonetic: '/ˈmæŋ.ɡoʊ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả xoài; loại trái cây nhiệt đới thơm ngọt có thịt vàng óng.',
    meaningEn: 'A fleshy yellowish-red tropical fruit that is eaten ripe or used green.',
    example: 'Sweet ripe mango is delicious in summer smoothies.',
    exampleVi: 'Xoài chín ngọt rất thơm ngon khi làm sinh tố mùa hè.'
  },
  GRAPE: {
    word: 'GRAPE',
    phonetic: '/ɡreɪp/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả nho; quả mọng mọc thành chùm, dùng để ăn hoặc ủ rượu.',
    meaningEn: 'A berry, typically green, purple, or black, growing in clusters on a grapevine.',
    example: 'We enjoyed a bowl of sweet seedless grapes.',
    exampleVi: 'Chúng tôi thưởng thức một bát nho ngọt không hạt.'
  },
  CHERRY: {
    word: 'CHERRY',
    phonetic: '/ˈtʃer.i/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả anh đào; quả nhỏ hình tròn màu đỏ thẫm với hạt cứng bên trong.',
    meaningEn: 'A small, round stone fruit that is typically bright or dark red.',
    example: 'She topped the ice cream with a fresh red cherry.',
    exampleVi: 'Cô ấy đặt một quả anh đào đỏ mọng lên đỉnh ly kem.'
  },
  LEMON: {
    word: 'LEMON',
    phonetic: '/ˈlem.ən/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quả chanh vàng; vị chua thanh thơm mát giàu vitamin C.',
    meaningEn: 'A yellow, oval citrus fruit with thick skin and fragrant, acidic juice.',
    example: 'Fresh lemon juice adds a wonderful zing to tea.',
    exampleVi: 'Nước cốt chanh tươi mang lại hương vị tươi mát tuyệt vời cho tách trà.'
  },

  // Sports
  SOCCER: {
    word: 'SOCCER',
    phonetic: '/ˈsɑː.kɚ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Bóng đá; môn thể thao vua nơi 2 đội 11 người tìm cách sút bóng vào khung thành.',
    meaningEn: 'A game played by two teams of eleven players with a round ball.',
    example: 'Millions of passionate fans watch the world soccer finals.',
    exampleVi: 'Hàng triệu người hâm mộ cuồng nhiệt theo dõi trận chung kết bóng đá thế giới.'
  },
  TENNIS: {
    word: 'TENNIS',
    phonetic: '/ˈten.ɪs/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Quần vợt; môn thể thao đánh banh nỉ qua lưới bằng vợt.',
    meaningEn: 'A racket sport that can be played individually or between two teams of two players.',
    example: 'She practiced her tennis serve every morning.',
    exampleVi: 'Cô ấy luyện cú giao bóng quần vợt mỗi buổi sáng.'
  },
  SURFING: {
    word: 'SURFING',
    phonetic: '/ˈsɝː.fɪŋ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Lướt sóng; môn thể thao cưỡi trên những con sóng đại dương bằng ván lướt.',
    meaningEn: 'The sport or pastime of riding a wave toward the shore while standing on a surfboard.',
    example: 'Surfing the big waves requires great balance and courage.',
    exampleVi: 'Lướt trên những con sóng lớn đòi hỏi sự thăng bằng tuyệt vời và lòng dũng cảm.'
  },

  // Planets
  MERCURY: {
    word: 'MERCURY',
    phonetic: '/ˈmɝː.kjə.ri/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Sao Thủy; hành tinh gần Mặt Trời nhất trong Hệ Mặt Trời.',
    meaningEn: 'The smallest and closest planet to the Sun in the Solar System.',
    example: 'Mercury has extreme temperatures between day and night.',
    exampleVi: 'Sao Thủy có nhiệt độ chênh lệch cực lớn giữa ngày và đêm.'
  },
  VENUS: {
    word: 'VENUS',
    phonetic: '/ˈviː.nəs/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Sao Kim; hành tinh sáng thứ hai sau Mặt Trăng, còn gọi là sao Hôm hay sao Mai.',
    meaningEn: 'The second planet from the Sun, named after the Roman goddess of love.',
    example: 'Venus shines brightly in the western sky just after sunset.',
    exampleVi: 'Sao Kim tỏa sáng rực rỡ ở phía tây ngay sau khi mặt trời lặn.'
  },
  EARTH: {
    word: 'EARTH',
    phonetic: '/ɝːθ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Trái Đất; hành tinh thứ ba tính từ Mặt Trời, hành tinh duy nhất có sự sống.',
    meaningEn: 'The planet on which we live; the world.',
    example: 'Earth is our shared home that we must protect.',
    exampleVi: 'Trái Đất là ngôi nhà chung mà tất cả chúng ta cần trân trọng bảo vệ.'
  },
  MARS: {
    word: 'MARS',
    phonetic: '/mɑːrz/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Sao Hỏa; hành tinh thứ tư từ Mặt Trời, còn được gọi là Hành Tinh Đỏ.',
    meaningEn: 'The fourth planet from the Sun, often referred to as the Red Planet.',
    example: 'Scientists are searching for past traces of water on Mars.',
    exampleVi: 'Các nhà khoa học đang tìm kiếm những dấu vết nguồn nước từng tồn tại trên sao Hỏa.'
  },
  JUPITER: {
    word: 'JUPITER',
    phonetic: '/ˈdʒuː.pə.t̬ɚ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Sao Mộc; hành tinh khí khổng lồ lớn nhất trong Hệ Mặt Trời.',
    meaningEn: 'The largest planet in the Solar System, an immense gas giant.',
    example: 'Jupiter has dozens of moons and a famous Great Red Spot.',
    exampleVi: 'Sao Mộc có hàng chục vệ tinh tự nhiên và vết Đỏ Lớn trứ danh.'
  },

  // Jobs
  DOCTOR: {
    word: 'DOCTOR',
    phonetic: '/ˈdɑːk.tɚ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Bác sĩ; người có chuyên môn y khoa khám và chữa bệnh.',
    meaningEn: 'A qualified practitioner of medicine; a physician.',
    example: 'The doctor provided compassionate care to all patients.',
    exampleVi: 'Vị bác sĩ tận tâm chăm sóc chu đáo cho mọi bệnh nhân.'
  },
  TEACHER: {
    word: 'TEACHER',
    phonetic: '/ˈtiː.tʃɚ/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Giáo viên, thầy cô giáo; người truyền đạt kiến thức và giáo dục học sinh.',
    meaningEn: 'A person who helps students to acquire knowledge, competence or virtue.',
    example: 'A great teacher inspires a lifelong love for learning.',
    exampleVi: 'Một người thầy giỏi sẽ truyền cảm hứng cho niềm đam mê học hỏi suốt đời.'
  },
  PILOT: {
    word: 'PILOT',
    phonetic: '/ˈpaɪ.lət/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Phi công; người điều khiển máy bay.',
    meaningEn: 'A person who operates the flying controls of an aircraft.',
    example: 'The experienced pilot landed the plane safely in stormy weather.',
    exampleVi: 'Viên phi công giàu kinh nghiệm đã hạ cánh máy bay an toàn trong thời tiết bão.'
  },

  // Weather
  SUN: {
    word: 'SUN',
    phonetic: '/sʌn/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Mặt Trời; ngôi sao ở trung tâm mang lại ánh sáng và sự sống.',
    meaningEn: 'The star around which the earth orbits and from which it receives light and warmth.',
    example: 'The morning sun warmed up the entire valley.',
    exampleVi: 'Ánh nắng ban mai sưởi ấm khắp thung lũng.'
  },
  RAIN: {
    word: 'RAIN',
    phonetic: '/reɪn/',
    partOfSpeech: 'Danh từ / Động từ',
    meaningVi: 'Cơn mưa; những giọt nước rơi từ các đám mây xuống đất.',
    meaningEn: 'Moisture condensed from the atmosphere that falls visibly in separate drops.',
    example: 'The refreshing rain nourished the thirsty crops.',
    exampleVi: 'Cơn mưa rào tươi mát đã tưới tắm cho những thửa ruộng đang khát nước.'
  },
  STORM: {
    word: 'STORM',
    phonetic: '/stɔːrm/',
    partOfSpeech: 'Danh từ',
    meaningVi: 'Cơn bão; hiện tượng thời tiết dữ dội với gió mạnh, sấm sét hoặc mưa lớn.',
    meaningEn: 'A violent disturbance of the atmosphere with strong winds and usually rain or snow.',
    example: 'The ship navigated carefully around the oncoming storm.',
    exampleVi: 'Con tàu đã cẩn trọng bẻ lái né tránh cơn bão đang kéo đến.'
  }
};

/**
 * Returns definition for any word, either exact match from dictionary or intelligent fallback
 */
export function getWordDefinition(word: string): WordDefinition {
  const upper = word.trim().toUpperCase();
  if (DICTIONARY[upper]) {
    return DICTIONARY[upper];
  }

  // Fallback generation for any word
  return {
    word: upper,
    phonetic: `/${upper.toLowerCase()}/`,
    partOfSpeech: 'Từ vựng tiếng Anh (Vocabulary)',
    meaningVi: `Từ vựng "${upper}" trong ma trận giải đố Word Cross.`,
    meaningEn: `An English word found in the Word Cross letter grid.`,
    example: `You successfully discovered the word "${upper}"!`,
    exampleVi: `Bạn đã tìm thấy thành công từ "${upper}" trên bảng chữ cái!`
  };
}
