export type ProductBenefit = {
  title: string;
  description: string;
};

export type ProductSpec = {
  label: string;
  value: string;
  why: string;
};

export type ProductSpecGroup = {
  title: string;
  items: ProductSpec[];
};

export type ProductDetail = {
  positioning: string;
  benefits: ProductBenefit[];
  specGroups: ProductSpecGroup[];
  sourceUrl: string;
  relatedSlugs: string[];
};

export const productDetails = {
  "iphone-17-pro-max": {
    positioning:
      "O modelo Pro de 6,9 polegadas, com o sistema de câmeras mais completo da linha e a maior autonomia entre os iPhones 17.",
    benefits: [
      {
        title: "Tela ampla e fluida",
        description:
          "A tela OLED de 6,9 polegadas oferece ProMotion adaptativo de até 120 Hz.",
      },
      {
        title: "Zoom de longo alcance",
        description:
          "As três câmeras Fusion de 48 MP incluem opções de 4x e 8x com qualidade óptica.",
      },
      {
        title: "Maior autonomia",
        description:
          "A Apple informa até 37 horas de reprodução de vídeo na configuração brasileira.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,9", 2868 × 1320 pixels e ProMotion até 120 Hz',
            why:
              "A área maior favorece vídeos, jogos, leitura e edição, mantendo alta densidade de pixels.",
          },
          {
            label: "Chip",
            value:
              "A19 Pro com CPU e GPU de 6 núcleos e Neural Engine de 16 núcleos",
            why:
              "Sustenta jogos, edição e o processamento computacional das câmeras.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Sistema traseiro",
            value:
              "Principal, ultra-angular e teleobjetiva Fusion de 48 MP, de 13 mm a 200 mm",
            why:
              "Cobre desde cenas amplas até assuntos distantes com diferentes distâncias focais.",
          },
          {
            label: "Câmera frontal",
            value:
              "Center Stage de 18 MP com foco automático e Captura Dupla",
            why:
              "Ajusta o enquadramento e permite gravar com as câmeras frontal e traseira ao mesmo tempo.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 37 horas de reprodução de vídeo",
            why:
              "É a maior duração declarada pela Apple entre os modelos brasileiros da linha iPhone 17.",
          },
          {
            label: "Conectividade",
            value:
              "5G, Wi-Fi 7, Bluetooth 6, Thread e USB 3 de até 10 Gb/s",
            why:
              "Combina padrões sem fio recentes com transferências rápidas por cabo.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/125091",
    relatedSlugs: ["iphone-17-pro", "iphone-air"],
  },
  "iphone-17-pro": {
    positioning:
      "Desempenho e câmeras Pro em um corpo menor, com tela de 6,3 polegadas.",
    benefits: [
      {
        title: "Desempenho Pro",
        description:
          "O A19 Pro reúne CPU e GPU de 6 núcleos para tarefas gráficas e computacionais exigentes.",
      },
      {
        title: "Três câmeras de 48 MP",
        description:
          "O sistema Fusion cobre ultra-angular, principal e teleobjetiva, incluindo zoom de 8x com qualidade óptica.",
      },
      {
        title: "ProMotion",
        description:
          "A tela OLED de 6,3 polegadas ajusta a atualização em até 120 Hz.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,3", 2622 × 1206 pixels e ProMotion até 120 Hz',
            why:
              "Entrega movimentos fluidos em um formato mais compacto que o Pro Max.",
          },
          {
            label: "Chip",
            value:
              "A19 Pro com CPU e GPU de 6 núcleos e Neural Engine de 16 núcleos",
            why:
              "Atende jogos, edição e processamento avançado de imagens.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Sistema traseiro",
            value:
              "Principal, ultra-angular e teleobjetiva Fusion de 48 MP, com opções de 2x, 4x e 8x",
            why:
              "Amplia as possibilidades de composição sem depender apenas do zoom digital.",
          },
          {
            label: "Câmera frontal",
            value:
              "Center Stage de 18 MP com foco automático e Captura Dupla",
            why:
              "Facilita selfies em grupo, videochamadas e gravações simultâneas.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 31 horas de reprodução de vídeo",
            why:
              "Fornece uma referência oficial de uso prolongado para o modelo brasileiro.",
          },
          {
            label: "Conectividade",
            value:
              "5G, Wi-Fi 7, Bluetooth 6, Thread e USB 3 de até 10 Gb/s",
            why:
              "Favorece redes recentes e transferências de arquivos grandes por cabo.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/125090",
    relatedSlugs: ["iphone-17-pro-max", "iphone-17"],
  },
  "iphone-air": {
    positioning:
      "O iPhone mais fino já criado, com estrutura de titânio, tela de 6,5 polegadas e chip A19 Pro.",
    benefits: [
      {
        title: "Corpo fino e leve",
        description: "Tem 5,6 mm de espessura e pesa 165 gramas.",
      },
      {
        title: "Tela ProMotion",
        description:
          "A tela OLED de 6,5 polegadas oferece atualização adaptativa de até 120 Hz.",
      },
      {
        title: "Desempenho A19 Pro",
        description:
          "O chip combina CPU de 6 núcleos e GPU de 5 núcleos.",
      },
    ],
    specGroups: [
      {
        title: "Design e desempenho",
        items: [
          {
            label: "Construção",
            value: "Estrutura de titânio, 5,6 mm de espessura e 165 g",
            why:
              "Reduz volume e peso mesmo com uma tela maior que a dos modelos de 6,1 e 6,3 polegadas.",
          },
          {
            label: "Chip",
            value:
              "A19 Pro com CPU de 6 núcleos, GPU de 5 núcleos e Neural Accelerators",
            why:
              "Fornece capacidade para jogos, fotografia computacional e recursos executados no aparelho.",
          },
        ],
      },
      {
        title: "Tela e câmeras",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,5" com ProMotion até 120 Hz',
            why:
              "Oferece mais espaço visual e movimentos mais fluidos.",
          },
          {
            label: "Câmeras",
            value:
              "Principal Fusion de 48 MP com opção 2x e frontal Center Stage de 18 MP",
            why:
              "Reúne dois enquadramentos traseiros e recursos de enquadramento automático na câmera frontal.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 27 horas de reprodução de vídeo",
            why:
              "É a medida oficial da Apple para comparar a duração da bateria.",
          },
          {
            label: "Conectividade",
            value:
              "Modem C1X, chip N1, 5G, Wi-Fi 7, Bluetooth 6 e Thread",
            why:
              "Os chips de conexão desenvolvidos pela Apple atendem redes celulares e padrões sem fio recentes.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/125092",
    relatedSlugs: ["iphone-17", "iphone-17-pro"],
  },
  "iphone-17": {
    positioning:
      "O modelo principal da geração 17, com tela ProMotion, chip A19 e duas câmeras Fusion de 48 MP.",
    benefits: [
      {
        title: "ProMotion até 120 Hz",
        description:
          "A tela adapta a taxa de atualização para movimentos mais fluidos.",
      },
      {
        title: "Duas câmeras de 48 MP",
        description:
          "As câmeras principal e ultra-angular Fusion registram imagens em alta resolução.",
      },
      {
        title: "Até 30 horas de vídeo",
        description:
          "A autonomia declarada supera a dos modelos Air, 17e, 16 e 15.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,3" com ProMotion até 120 Hz',
            why:
              "Melhora a fluidez de rolagens, animações e jogos.",
          },
          {
            label: "Chip",
            value: "A19",
            why:
              "Processa gráficos, recursos do sistema e fotografia computacional da geração.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Sistema traseiro",
            value:
              "Principal Fusion de 48 MP e ultra-angular Fusion de 48 MP",
            why:
              "Combina alta resolução com maior flexibilidade de enquadramento.",
          },
          {
            label: "Câmera frontal",
            value: "Center Stage de 18 MP",
            why:
              "Ajusta o enquadramento para selfies, grupos e videochamadas.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 30 horas de reprodução de vídeo",
            why:
              "Oferece uma referência comparável de duração para uso multimídia.",
          },
          {
            label: "Conectividade",
            value:
              "Chip N1, 5G, Wi-Fi 7, Bluetooth 6 e MagSafe de até 25 W",
            why:
              "Reúne padrões sem fio recentes e recarga magnética rápida.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/125089",
    relatedSlugs: ["iphone-air", "iphone-17e"],
  },
  "iphone-17e": {
    positioning:
      "Modelo de 6,1 polegadas da família 17, com chip A19, câmera Fusion de 48 MP e MagSafe.",
    benefits: [
      {
        title: "Chip A19",
        description: "Usa a mesma geração de chip do iPhone 17.",
      },
      {
        title: "Câmera Fusion de 48 MP",
        description:
          "A câmera traseira oferece fotos de 24 ou 48 MP e uma opção de enquadramento 2x.",
      },
      {
        title: "MagSafe",
        description:
          "Admite acessórios magnéticos e recarga MagSafe de até 15 W.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,1" com Ceramic Shield 2',
            why:
              "Combina alto contraste com a proteção frontal mais recente desta geração.",
          },
          {
            label: "Chip",
            value: "A19",
            why:
              "Sustenta os recursos computacionais e de imagem da família iPhone 17.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Câmera traseira",
            value:
              "Principal Fusion de 48 MP, fotos de 24 ou 48 MP e opção 2x",
            why:
              "Uma única câmera oferece enquadramentos principal e aproximado.",
          },
          {
            label: "Câmera frontal",
            value: "TrueDepth de 12 MP",
            why:
              "Atende selfies, videochamadas e autenticação por Face ID.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 26 horas de reprodução de vídeo",
            why:
              "Fornece uma medida oficial para comparação com os demais modelos.",
          },
          {
            label: "Conectividade",
            value:
              "Modem C1X, 5G, Wi-Fi 6 e MagSafe de até 15 W",
            why:
              "Combina conexão celular, redes Wi-Fi e o ecossistema de acessórios magnéticos.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/126470",
    relatedSlugs: ["iphone-17", "iphone-16"],
  },
  "iphone-16": {
    positioning:
      "Modelo de 6,1 polegadas com chip A18, Controle da Câmera e sistema traseiro com captura macro.",
    benefits: [
      {
        title: "Controle da Câmera",
        description:
          "O controle dedicado abre a câmera e permite operar ajustes compatíveis.",
      },
      {
        title: "Fotografia macro",
        description:
          "A câmera ultra-angular com foco automático registra objetos a curta distância.",
      },
      {
        title: "Chip A18",
        description:
          "O chip processa os recursos de câmera, gráficos e Apple Intelligence.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,1" com Dynamic Island',
            why:
              "A Dynamic Island exibe alertas e atividades em andamento na parte superior.",
          },
          {
            label: "Chip",
            value: "A18",
            why:
              "Atende fotografia computacional, gráficos e recursos de inteligência executados no aparelho.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Sistema traseiro",
            value:
              "Principal Fusion de 48 MP e ultra-angular de 12 MP com foco automático",
            why:
              "Oferece enquadramento 2x, campo de visão amplo e captura macro.",
          },
          {
            label: "Controle dedicado",
            value: "Controle da Câmera",
            why:
              "Agiliza a abertura da câmera e o acesso a funções fotográficas.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 22 horas de reprodução de vídeo",
            why:
              "É a referência oficial de duração do modelo de 6,1 polegadas.",
          },
          {
            label: "Conectividade",
            value:
              "5G, Wi-Fi 7, Bluetooth 5.3 e MagSafe de até 25 W",
            why:
              "Atende redes recentes e oferece recarga magnética mais rápida que a do iPhone 15.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/121029",
    relatedSlugs: ["iphone-17e", "iphone-15"],
  },
  "iphone-15": {
    positioning:
      "Modelo de 6,1 polegadas com Dynamic Island, câmera principal de 48 MP e conexão USB-C.",
    benefits: [
      {
        title: "Câmera de 48 MP",
        description:
          "A câmera principal registra imagens em alta resolução e oferece uma opção 2x pelo sensor.",
      },
      {
        title: "Dynamic Island",
        description:
          "A área superior da tela apresenta alertas e atividades em andamento.",
      },
      {
        title: "Conector USB-C",
        description:
          "O mesmo conector pode ser usado para recarga, sincronização e acessórios compatíveis.",
      },
    ],
    specGroups: [
      {
        title: "Tela e desempenho",
        items: [
          {
            label: "Tela",
            value:
              'Super Retina XDR OLED de 6,1" com Dynamic Island',
            why:
              "Combina alto contraste com informações contextuais na parte superior da tela.",
          },
          {
            label: "Chip",
            value: "A16 Bionic",
            why:
              "Processa fotografia computacional, vídeo, gráficos e tarefas do sistema.",
          },
        ],
      },
      {
        title: "Câmeras",
        items: [
          {
            label: "Sistema traseiro",
            value:
              "Principal de 48 MP e ultra-angular de 12 MP com campo de visão de 120°",
            why:
              "Permite alternar entre imagens detalhadas e cenas mais amplas.",
          },
          {
            label: "Opção 2x",
            value:
              "Teleobjetiva 2x de 12 MP habilitada pelo sensor quad-pixel",
            why:
              "Acrescenta um enquadramento aproximado sem uma câmera teleobjetiva dedicada.",
          },
        ],
      },
      {
        title: "Bateria e conexões",
        items: [
          {
            label: "Autonomia",
            value: "Até 20 horas de reprodução de vídeo",
            why:
              "É a medida oficial usada pela Apple para comparação de bateria.",
          },
          {
            label: "Conectividade",
            value:
              "5G, Wi-Fi 6, Bluetooth 5.3, USB-C e MagSafe de até 15 W",
            why:
              "Reúne conexão celular, acessórios USB-C e recarga magnética.",
          },
        ],
      },
    ],
    sourceUrl: "https://support.apple.com/pt-br/111831",
    relatedSlugs: ["iphone-16", "iphone-17e"],
  },
} satisfies Record<string, ProductDetail>;

export function getProductDetail(slug: string) {
  return (productDetails as Record<string, ProductDetail>)[slug];
}
