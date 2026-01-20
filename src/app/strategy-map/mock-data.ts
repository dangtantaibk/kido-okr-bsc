export interface StrategyNodeData {
  id: string;
  label: string;
  category: 'TÀI CHÍNH' | 'KHÁCH HÀNG' | 'QUY TRÌNH NỘI BỘ' | 'HỌC HỎI & PHÁT TRIỂN';
  status: 'on-track' | 'at-risk' | 'off-track';
  progress: number;
  ownerName: string;
  ownerRole: string;
  ownerAvatar?: string;
  code: string; // e.g., F1.0, C2.1
  goals?: { label: string; current: string; target: string; isCompleted: boolean }[];
  strategies?: string[];
}

export const initialNodes = [
  // --- TÀI CHÍNH (FINANCE) ---
  {
    id: 'f1',
    type: 'goal',
    position: { x: 400, y: 50 },
    data: {
      id: 'f1',
      label: 'Tăng trưởng doanh thu 20%',
      category: 'TÀI CHÍNH',
      status: 'on-track',
      progress: 85,
      ownerName: 'Nguyễn Văn A',
      ownerRole: 'Giám đốc Tài chính',
      code: 'F1.0',
      goals: [
        { label: 'Doanh thu thuần', current: '850 tỷ', target: '1000 tỷ', isCompleted: false },
        { label: 'Lợi nhuận ròng', current: '120 tỷ', target: '150 tỷ', isCompleted: true },
      ],
      strategies: [
        'Tối ưu hóa danh mục đầu tư',
        'Cắt giảm chi phí vận hành không cần thiết'
      ]
    },
  },

  // --- KHÁCH HÀNG (CUSTOMER) ---
  {
    id: 'c1',
    type: 'goal',
    position: { x: 200, y: 300 },
    data: {
      id: 'c1',
      label: 'Nâng cao trải nghiệm khách hàng',
      category: 'KHÁCH HÀNG',
      status: 'at-risk', // Cần chú ý is roughly at-risk
      progress: 72,
      ownerName: 'Trần Thị B',
      ownerRole: 'Giám đốc CSKH',
      code: 'C2.1',
      goals: [
        { label: 'Đạt điểm CSAT 4.5/5', current: '4.2/5', target: '4.5/5', isCompleted: true },
        { label: 'Giảm thời gian phản hồi < 2h', current: '3.5h', target: '< 2h', isCompleted: false },
      ],
      strategies: [
        'Triển khai hệ thống CRM mới để theo dõi tương tác đa kênh',
        'Đào tạo nhân viên CSKH về tư duy phục vụ chủ động'
      ]
    },
  },
  {
    id: 'c2',
    type: 'goal',
    position: { x: 600, y: 300 },
    data: {
      id: 'c2',
      label: 'Mở rộng thị phần miền Nam',
      category: 'KHÁCH HÀNG',
      status: 'off-track',
      progress: 45,
      ownerName: 'Lê Văn C',
      ownerRole: 'Giám đốc Kinh doanh',
      code: 'C2.2',
      goals: [
        { label: 'Thị phần', current: '12%', target: '20%', isCompleted: false },
      ],
      strategies: [
        'Tăng cường marketing tại điểm bán',
        'Phát triển đại lý phân phối mới'
      ]
    },
  },

  // --- QUY TRÌNH NỘI BỘ (PROCESS) ---
  {
    id: 'p1',
    type: 'goal',
    position: { x: 200, y: 550 },
    data: {
      id: 'p1',
      label: 'Tối ưu quy trình giao hàng',
      category: 'QUY TRÌNH NỘI BỘ',
      status: 'on-track',
      progress: 90,
      ownerName: 'Phạm Văn D',
      ownerRole: 'Giám đốc Vận hành',
      code: 'P3.1',
      goals: [
        { label: 'Tỷ lệ giao đúng hạn', current: '98%', target: '99%', isCompleted: true },
      ],
      strategies: [
        'Áp dụng AI trong định tuyến giao hàng',
      ]
    },
  },
  {
    id: 'p2',
    type: 'goal',
    position: { x: 600, y: 550 },
    data: {
      id: 'p2',
      label: 'Số hóa quản trị kho',
      category: 'QUY TRÌNH NỘI BỘ',
      status: 'at-risk',
      progress: 60,
      ownerName: 'Hoàng Thị E',
      ownerRole: 'Trưởng phòng Kho vận',
      code: 'P3.2',
      goals: [
        { label: 'Tỷ lệ tồn kho chính xác', current: '92%', target: '100%', isCompleted: false },
      ],
      strategies: [
        'Triển khai ERP module kho',
      ]
    },
  },

  // --- HỌC HỎI & PHÁT TRIỂN (LEARNING) ---
  {
    id: 'l1',
    type: 'goal',
    position: { x: 100, y: 800 },
    data: {
      id: 'l1',
      label: 'Đào tạo kỹ năng số',
      category: 'HỌC HỎI & PHÁT TRIỂN',
      status: 'off-track',
      progress: 30,
      ownerName: 'Vũ Văn F',
      ownerRole: 'Trưởng phòng Đào tạo',
      code: 'L4.1',
      goals: [
        { label: 'Số lượng nhân viên đạt chứng chỉ', current: '30', target: '100', isCompleted: false },
      ],
      strategies: [
        'Hợp tác với các trung tâm đào tạo công nghệ',
      ]
    },
  },
  {
    id: 'l2',
    type: 'goal',
    position: { x: 400, y: 800 },
    data: {
      id: 'l2',
      label: 'Tuyển dụng nhân sự AI',
      category: 'HỌC HỎI & PHÁT TRIỂN',
      status: 'on-track',
      progress: 100,
      ownerName: 'Đặng Thị G',
      ownerRole: 'Giám đốc Nhân sự',
      code: 'L4.2',
      goals: [
        { label: 'Tuyển dụng chuyên gia AI', current: '3', target: '3', isCompleted: true },
      ],
      strategies: [
        'Headhunt từ các công ty công nghệ lớn',
      ]
    },
  },
  {
    id: 'l3',
    type: 'goal',
    position: { x: 700, y: 800 },
    data: {
      id: 'l3',
      label: 'Văn hóa đổi mới sáng tạo',
      category: 'HỌC HỎI & PHÁT TRIỂN',
      status: 'at-risk',
      progress: 50,
      ownerName: 'Đặng Thị G',
      ownerRole: 'Giám đốc Nhân sự',
      code: 'L4.3',
      goals: [
        { label: 'Số ý tưởng mới được triển khai', current: '5', target: '10', isCompleted: false },
      ],
      strategies: [
        'Tổ chức cuộc thi Innovation Day',
      ]
    },
  },
];

export const initialEdges = [
  // Creating generic links to simulate visualization
  { id: 'e1', source: 'c1', target: 'f1', type: 'smoothstep', animated: true },
  { id: 'e2', source: 'c2', target: 'f1', type: 'smoothstep', animated: true },

  { id: 'e3', source: 'p1', target: 'c1', type: 'smoothstep', animated: true },
  { id: 'e4', source: 'p2', target: 'c2', type: 'smoothstep', animated: true },

  { id: 'e5', source: 'l1', target: 'p1', type: 'smoothstep', animated: true },
  { id: 'e6', source: 'l2', target: 'p1', type: 'smoothstep', animated: true },
  { id: 'e7', source: 'l3', target: 'p2', type: 'smoothstep', animated: true },
];
