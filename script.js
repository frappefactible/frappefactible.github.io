document.addEventListener('DOMContentLoaded', () => {

    // --- NUEVO: MAPA DE COLORES POR FASE ---
    const phaseColors = {
        1: '#FF4500', 2: '#B8860B', 3: '#00BFFF', 4: '#556B2F',
        5: '#4A4A4A', 6: '#C2B280', 7: '#8A2BE2', 8: '#1E90FF',
        9: '#191970', 10: '#FF7F50', 11: '#7FFF00', 12: '#DC143C'
    };
    // Mapeo de tipos a 4 iconos específicos.
    const typeToIcon = {
        'Anime': 'fa-solid fa-tv',
        'Película': 'fa-solid fa-film',
        'OVA': 'fa-solid fa-video',
        'Película Anime': 'fa-solid fa-video',
        'Manga': 'fa-solid fa-book',
        'Serie': 'fa-solid fa-film',
        'Manga / Futuro Anime': 'fa-solid fa-book'
    };

    // Lista completa con títulos formateados e imágenes.
    // --- ¡LISTA ACTUALIZADA CON IMÁGENES DE TMDB! ---
    const mediaList = [
        // Fase 1: ARRANQUE EXPLOSIVO
        { id: 1, title: '[Commando] Commando (1985)', type: 'Película', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/cA6a4xW76bNZdXZKLCr4YkdpElK.jpg' },
        { id: 2, title: '[Red Heat] Red Heat (1988)', type: 'Película', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/zryS52ge0fk7NMt1koH9YcMaooA.jpg' },
        { id: 3, title: '[ライディング・ビーン] Riding Bean (1989)', type: 'OVA', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/bZyuxz1dosJpmdmHhs9KdTEzrQx.jpg' },
        { id: 4, title: '[ガンスミスキャッツ] Gunsmith Cats (1995)', type: 'OVA', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/nl0JH0b5JfJDaN1KuS0YbSfOxPX.jpg' },
        { id: 5, title: '[Demolition Man] Demolition Man (1993)', type: 'Película', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/4ibsnd6k5ZIvxPZAUWcKKwCgnab.jpg' },
        { id: 6, title: '[Total Recall] Total Recall (1990)', type: 'Película', phase: 1, phaseName: 'ARRANQUE EXPLOSIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/v7DoneFNYIrCGeNFiPrqGiQlimN.jpg' },
        // Fase 2: ICONOS Y LEYENDAS
        { id: 7, title: '[Léon] Léon: The Professional (1994)', type: 'Película', phase: 2, phaseName: 'ICONOS Y LEYENDAS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/eWf4KEaCpiWcDOBkTiNQ0328k3H.jpg' },
        { id: 8, title: '[John Wick] John Wick (2014)', type: 'Película', phase: 2, phaseName: 'ICONOS Y LEYENDAS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tDl5ac1VJwMRvlgINDCsDCqg9CE.jpg' },
        { id: 9, title: '[カウボーイビバップ] Cowboy Bebop (1998)', type: 'Anime', phase: 2, phaseName: 'ICONOS Y LEYENDAS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/xDiXDfZwC6XYC6fxHI1jl3A3Ill.jpg' },
        { id: 10, title: '[Blade Runner] Blade Runner (1982)', type: 'Película', phase: 2, phaseName: 'ICONOS Y LEYENDAS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/pBA2J6iQMiP5Zd4ewMKdOWfq1HV.jpg' },
        { id: 11, title: '[AKIRA] Akira (1988)', type: 'Película Anime', phase: 2, phaseName: 'ICONOS Y LEYENDAS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/vjPt8HYymLOkRv82x9JwVO7M2a5.jpg' },
        // Fase 3: NEÓN Y PÓLVORA
        { id: 12, title: '[バブルガムクライシス] Bubblegum Crisis (1987)', type: 'OVA', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/rnF1zD3GP3L4DDoLIshUEH0JYHJ.jpg' },
        { id: 13, title: '[アミテージ・ザ・サード] Armitage III (1995)', type: 'OVA', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tUSuhszUrM6ffR1MRBphnpRtsyX.jpg' },
        { id: 14, title: '[PSYCHO-PASS サイコパス] Psycho-Pass (2012)', type: 'Anime', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/xHFMsGXdjXJDXMQvHhh7owu7TGr.jpg' },
        { id: 15, title: '[Minority Report] Minority Report (2002)', type: 'Anime', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/pnzJEfXpRc1bknR5ASFG0MZcTvo.jpg' },
        { id: 16, title: '[GANGSTA.] GANGSTA. (2015)', type: 'Película Anime', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/ly43ajQpjpYYnx3w5BgFtcflUTD.jpg' },
        { id: 17, title: '[Serbian Scars] Cicatrices Serbias (2009)', type: 'Película', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/igsaXntB4xW6M5w1wAChwn6DggD.jpg' },
        { id: 18, title: '[Технотајз: Едит и ја] Technotise: Edit & I (2009)', type: 'Película', phase: 3, phaseName: 'NEÓN Y PÓLVORA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/wSGbVkWZEl3556M1bia8rk5jWnn.jpg' },
        // Fase 4: CAMPO DE BATALLA
        { id: 19, title: '[BLACK LAGOON] Black Lagoon (2006)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/sQlHhWScg6qmakL1ywtcjjVKKqV.jpg' },
        { id: 20, title: '[ヨルムンガンド] Jormungand (2012)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/2v886zu4uziTmmtjRWXaWjf1QeU.jpg' },
        { id: 21, title: '[Лучшие в аду] The Best in Hell (2022)', type: 'OVA', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/2x1swT7xOyYZAdsKO3GclVcYrR3.jpg' },
        { id: 22, title: '[GATE（ゲート）自衛隊 彼の地にて、斯く戦えり] GATE (2015)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/bCuJkIUg1n9etSYrrQKlQuSrigE.jpg' },
        { id: 23, title: '[機動戦士ガンダム 第08MS小隊] Mobile Suit Gundam: The 08th MS Team (1996)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tzr1YdnPSIWMMgyb6Uzi3f9I8p3.jpg' },
        { id: 24, title: '[幼女戦記] Saga of Tanya the Evil (2017)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/slamFBuUGFtL4LtWpS9qXQ1qSLl.jpg' },
        { id: 25, title: '[Axis Powers ヘタリア] Hetalia: Axis Powers (2009)', type: 'Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/original/kJfZKulii7UKa880BLQ7WlzUwCA.jpg' },
        { id: 26, title: '[将国のアルタイル] Altair: A Record of Battles (2017)', type: 'Película', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/g8LNOGIqvzpMlb6XzmJhY46j1t5.jpg' },
        { id: 27, title: '[Empire of the Sun] Empire of the Sun (1987)', type: 'Película', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/6s0RoC4LuRNKnVWeQ3gq5J8uprN.jpg' },
        { id: 28, title: '[人狼 JIN-ROH] Jin-Roh: The Wolf Brigade (1999)', type: 'Película Anime', phase: 4, phaseName: 'CAMPO DE BATALLA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/iyLKFR339GCzTKUtrVO4hbeEhub.jpg' },
        // Fase 5: CICATRICES DE GUERRA
        { id: 29, title: '[Lepa sela lepo gore] Pretty Village, Pretty Flame (1996)', type: 'Película', phase: 5, phaseName: 'CICATRICES DE GUERRA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/kh4VuXrgAmQCSKFsQHXdZ03l0rC.jpg' },
        { id: 30, title: '[Балканский рубеж] The Balkan Line (2019)', type: 'Película', phase: 5, phaseName: 'CICATRICES DE GUERRA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/anL1b22zyf9NnM3BPuy9tZxb22a.jpg' },
        { id: 31, title: '[Savior] Savior (1998)', type: 'Película', phase: 5, phaseName: 'CICATRICES DE GUERRA', imageUrl: 'https://image.tmdb.org/t/p/original/6aHRUTqZr5C6te3VYGSJcnlS5bl.jpg' },
        { id: 32, title: '[Krugovi] Circles (2013)', type: 'Película', phase: 5, phaseName: 'CICATRICES DE GUERRA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/jfLN4kwSPcKsBbcs2r6a6SizQmv.jpg' },
        { id: 33, title: '[In the Land of Blood and Honey] In the Land of Blood and Honey (2011)', type: 'Película', phase: 5, phaseName: 'CICATRICES DE GUERRA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/h1r4qey0K8PG9OgQdDqQcXtMq6c.jpg' },
        // Fase 6: HORIZONTES DESOLADOS
        { id: 34, title: '[少女終末旅行] Girls\' Last Tour (2017)', type: 'Anime', phase: 6, phaseName: 'HORIZONTES DESOLADOS', imageUrl: 'https://image.tmdb.org/t/p/original/52MoeswRoEgREmpfAoM5BLjOt83.jpg' },
        { id: 35, title: '[コッペリオン] COPPELION (2013)', type: 'Anime', phase: 6, phaseName: 'HORIZONTES DESOLADOS', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/mPQuea0bhoh4oV9nRmJpisHUiZ0.jpg' },
        // Fase 7: TELARAÑA NARRATIVA
        { id: 36, title: '[Pulp Fiction] Pulp Fiction (1994)', type: 'Película', phase: 7, phaseName: 'TELARAÑA NARRATIVA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
        { id: 37, title: '[バッカーノ!] Baccano! (2007)', type: 'Anime', phase: 7, phaseName: 'TELARAÑA NARRATIVA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qOxUTQAOTrMKTHuC9HQZiVsTK0F.jpg' },
        { id: 38, title: '[DARKER THAN BLACK -黒の契約者-] Darker than Black (2007)', type: 'Anime', phase: 7, phaseName: 'TELARAÑA NARRATIVA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/i2jS5N0FK9o58Lxh5mnkOzEDZsd.jpg' },
        { id: 39, title: '[LAZARUS ラザロ] Lazarus (2025)', type: 'Anime', phase: 7, phaseName: 'TELARAÑA NARRATIVA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/ActpqKbShWGYNDRsCjTueRixlrr.jpg' },
        // Fase 8: AVENTURA Y ADRENALINA
        { id: 40, title: '[紅の豚] Porco Rosso (1992)', type: 'Película Anime', phase: 8, phaseName: 'AVENTURA Y ADRENALINA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/j3RaEwYQ2D4fbdr3nMa3JXSK15o.jpg' },
        { id: 41, title: '[Nobody] Nadie (2021)', type: 'Película', phase: 8, phaseName: 'AVENTURA Y ADRENALINA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/ddO5a3tMPpQutSDQO1bESgLWadB.jpg' },
        { id: 42, title: '[Atomic Blonde] Atómica (2017)', type: 'Película', phase: 8, phaseName: 'AVENTURA Y ADRENALINA', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/9DRFozlq1IMD7aMLzdRzWEEH6SH.jpg' },
        { id: 43, title: '[The Raid: Redemption] The Raid (2011)', type: 'Película', phase: 8, phaseName: 'AVENTURA Y ADRENALINA', imageUrl: 'https://image.tmdb.org/t/p/original/Abnm1Ws3JH0ReCfEhLMPwPcMcGO.jpg' },
        // Fase 9: ABISMO REFLEXIVO
        { id: 44, title: '[GHOST IN THE SHELL / 攻殻機動隊] Ghost in the Shell (1995)', type: 'Película Anime', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/mo4PUj0SWiX33uQMgxyzE2ZOPBK.jpg' },
        { id: 45, title: '[イノセンス] Ghost in the Shell 2: Innocence (2004)', type: 'Película Anime', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/original/w2JxX0zCHtTU7XrNjHBij2uZKiV.jpg' },
        { id: 46, title: '[Gattaca] Gattaca (1997)', type: 'Película', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/1gXcEISnpV8IXCylhGI4eyBKjM.jpg' },
        { id: 47, title: '[Equilibrium] Equilibrium (2002)', type: 'Película', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/eW3YrxOh3rd6PnRgMSftYoflvfe.jpg' },
        { id: 48, title: '[エルゴプラクシー] Ergo Proxy (2006)', type: 'Anime', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/tHcce6PKnhNBneSMbadI4jynHpY.jpg' },
        { id: 49, title: '[虐殺器官] Genocidal Organ (2017)', type: 'Película Anime', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/aL5mNV5UgUoQ00qsC6dvwgQcIbA.jpg' },
        { id: 50, title: '[The Man in the High Castle] The Man in the High Castle (2015)', type: 'Serie', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/4IljeGfUK3QpYxDUJKyi7K411Ro.jpg' },
        { id: 51, title: '[NieR:Automata Ver1.1a] NieR:Automata Ver1.1a (2023)', type: 'Anime', phase: 9, phaseName: 'ABISMO REFLEXIVO', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qHSCYOXHV3EKXKkMxUvC9rGx4Av.jpg' },
        // Fase 10: ESPÍRITU, COMEDIA Y ROMANCE
        { id: 52, title: '[はじめの一歩] Hajime no Ippo: The Fighting! (2000)', type: 'Anime', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/1LApB9C9kEkh2ZU2vzAhurNDipl.jpg' },
        { id: 53, title: '[ゴールデンボーイ] Golden Boy (1995)', type: 'Anime', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/ahkQ6qnqouwZw7nro2YDEYLzrNn.jpg' },
        { id: 54, title: '[時々ボソッとロシア語でデレる隣のアーリャさん] Alya Sometimes Hides Her Feelings in Russian (2024)', type: 'Anime', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/hfnzByZIRj6rx8xaxzS2zDilei1.jpg' },
        { id: 55, title: '[エクセル・サーガ] Excel Saga (1999)', type: 'OVA', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/sr5nHUOuGDmysbANKJN1eV2wzrX.jpg' },
        { id: 56, title: '[トモちゃんは女の子!] Tomo-chan Is a Girl! (2023)', type: 'Anime', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/h9TN2BltJ9Q7FZ5BYGQcHfYfEGp.jpg' },
        { id: 57, title: '[天幕のジャードゥーガル] A Witch\'s Life in Mongol (2021)', type: 'Manga', phase: 10, phaseName: 'ESPÍRITU, COMEDIA Y ROMANCE', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/A_Witch%27s_Life_in_Mongol_volume_1_cover.jpg' },
        // Fase 11: CUMBRE EXPERIMENTAL
        { id: 58, title: '[パプリカ] Paprika (2006)', type: 'Película Anime', phase: 11, phaseName: 'CUMBRE EXPERIMENTAL', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/j9QZkFkaR9LmvRumn88te0d6qsC.jpg' },
        { id: 59, title: '[TENET] TENET (2020)', type: 'Película', phase: 11, phaseName: 'CUMBRE EXPERIMENTAL', imageUrl: 'https://image.tmdb.org/t/p/original/67p7XVP5SLup521iD9cAayMNt2U.jpg' },
        { id: 60, title: '[Blade Runner 2049] Blade Runner 2049 (2017)', type: 'Película', phase: 11, phaseName: 'CUMBRE EXPERIMENTAL', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/cOt8SQwrxpoTv9Bc3kyce3etkZX.jpg' },
        // Fase 12: Cazadores de Demonios. Sangre. Caos.
        { id: 61, title: '[Devil May Cry] Devil May Cry (2025)', type: 'Anime', phase: 12, phaseName: 'Cazadores de Demonios. Sangre. Caos.', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/mX9tqfpjqwreONJHhap7SnSSowe.jpg' },
        { id: 62, title: '[チェンソーマン レゼ篇] Chainsaw Man - The Movie: Reze Arc (2025)', type: 'Película Anime', phase: 12, phaseName: 'Cazadores de Demonios. Sangre. Caos.', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/3gq3Nc6wkgXrjPTkebAwOwe8l7x.jpg' },
        { id: 63, title: '[ダンダダン] Dandadan (2024)', type: 'Anime', phase: 12, phaseName: 'Cazadores de Demonios. Sangre. Caos.', imageUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/bOPmmOXj33bxVW5DoWabkCLn6vE.jpg' },
    ].map(item => ({ ...item, icon: typeToIcon[item.type] || 'fa-solid fa-question-circle' }));

    const listContainer = document.getElementById('media-list');
    const gridContainer = document.getElementById('media-grid');
    const mediaCount = document.getElementById('media-count');
    const searchInput = document.querySelector('.sidebar-header input');
    
    let currentSelectedId = null;

    // --- GENERACIÓN DE LA INTERFAZ MEJORADA ---

    function generateSidebar() {
        let listHTML = ''; let currentPhase = -1;
        mediaList.forEach(item => {
            if (item.phase !== currentPhase) {
                currentPhase = item.phase;
                // Se aplica el color de la fase directamente al H3
                listHTML += `<h3 class="phase-header" style="color: ${phaseColors[currentPhase]};">${item.phaseName}</h3>`;
            }
            listHTML += `<li data-id="${item.id}"><i class="${item.icon}"></i> ${item.title}</li>`;
        });
        listContainer.innerHTML = listHTML;
    }

    function generateGrid() {
        let gridHTML = '';
        mediaList.forEach(item => {
            gridHTML += `<div class="media-poster" id="poster-${item.id}" data-id="${item.id}" title="${item.title}" style="background-image: url('${item.imageUrl}');"></div>`;
        });
        gridContainer.innerHTML = gridHTML;
        mediaCount.textContent = `(${mediaList.length})`;
        addEventListenersToPosters();
    }
    
    // --- BLOQUE DE ANIMACIONES AVANZADO ---
    
    function animateHeaderIn() {
        anime({ targets: '.grid-header h2', translateY: [-20, 0], opacity: [0, 1], duration: 1000, easing: 'easeOutExpo' });
    }

    function animateGridIn() {
        anime({ targets: '.media-poster', opacity: 1, scale: [0.9, 1], translateY: [20, 0], delay: anime.stagger(40), duration: 800, easing: 'easeOutExpo' });
    }

    function addEventListenersToPosters() {
        document.querySelectorAll('.media-poster').forEach(poster => {
            poster.addEventListener('mouseenter', () => {
                if (parseInt(poster.dataset.id) !== currentSelectedId) {
                    anime({ targets: poster, translateY: -10, scale: 1.05, boxShadow: '0 12px 24px rgba(0,0,0,0.4)', duration: 300, easing: 'easeOutQuad' });
                }
            });
            poster.addEventListener('mouseleave', () => {
                if (parseInt(poster.dataset.id) !== currentSelectedId) {
                    anime({ targets: poster, translateY: 0, scale: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.3)', duration: 300, easing: 'easeOutQuad' });
                }
            });
        });
    }

    // --- FUNCIÓN DE SELECCIÓN CON COLORES DINÁMICOS ---
    function handleSelect(itemId) {
        if (itemId === currentSelectedId) return;
        
        const mediaItem = mediaList.find(item => item.id === itemId);
        if (!mediaItem) return;
        
        const phaseColor = phaseColors[mediaItem.phase]; // Obtenemos el color de la fase actual

        // 1. Animar la DESELECCIÓN del elemento anterior
        if (currentSelectedId !== null) {
            const previousPoster = document.getElementById(`poster-${currentSelectedId}`);
            const previousLi = listContainer.querySelector('.active');
            if (previousLi) {
                previousLi.classList.remove('active');
                anime({ targets: previousLi, backgroundColor: 'rgba(0, 0, 0, 0)', borderLeftColor: 'rgba(0, 0, 0, 0)', duration: 400 });
            }
            if (previousPoster) {
                anime({ targets: previousPoster, scale: 1, translateY: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.3)', duration: 400, easing: 'easeOutQuad' });
            }
        }
        
        // 2. Animar la SELECCIÓN del nuevo elemento
        const newLi = listContainer.querySelector(`li[data-id="${itemId}"]`);
        if (newLi) {
            newLi.classList.add('active');
            // Transición de color suave para el fondo y el borde del <li>
            anime({ targets: newLi, backgroundColor: `${phaseColor}4D`, borderLeftColor: phaseColor, duration: 600, easing: 'easeOutExpo' });
        }

        const newPoster = document.getElementById(`poster-${itemId}`);
        if (newPoster) {
            newPoster.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // El brillo del póster ahora usa el color de la fase
            anime({
                targets: newPoster, scale: 1.1, translateY: -15,
                boxShadow: `0 0 35px 10px ${phaseColor}`, // ¡Color dinámico!
                duration: 600, easing: 'easeOutElastic(1, .6)'
            });
        }
        
        currentSelectedId = itemId;
    }

    // --- BLOQUE DE INTERACTIVIDAD ---
    listContainer.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (li) handleSelect(parseInt(li.dataset.id));
    });
    
    gridContainer.addEventListener('click', (event) => {
        const poster = event.target.closest('.media-poster');
        if(poster) handleSelect(parseInt(poster.dataset.id));
    });

    // MEJORA 3: Filtro de búsqueda fluido
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        const animations = []; // Coleccionaremos las animaciones aquí

        mediaList.forEach(item => {
            const listItem = listContainer.querySelector(`li[data-id="${item.id}"]`);
            const posterItem = gridContainer.querySelector(`#poster-${item.id}`);
            const isVisible = item.title.toLowerCase().includes(searchTerm);

            if (posterItem) {
                const isCurrentlyHidden = posterItem.style.opacity === "0";
                
                if (isVisible && isCurrentlyHidden) { // Animar para MOSTRAR
                    posterItem.classList.remove('hidden');
                    animations.push(anime({ targets: posterItem, opacity: 1, scale: 1, duration: 400, easing: 'easeOutExpo' }).finished);
                } else if (!isVisible && !isCurrentlyHidden) { // Animar para OCULTAR
                     animations.push(anime({
                        targets: posterItem, opacity: 0, scale: 0.9, duration: 300, easing: 'easeInExpo',
                        complete: () => posterItem.classList.add('hidden')
                    }).finished);
                }
            }

            if(listItem) listItem.classList.toggle('hidden', !isVisible);
            if(isVisible) visibleCount++;
        });

        // Ocultar cabeceras de fase de forma asíncrona
        Promise.all(animations).then(() => {
            const phaseHeaders = listContainer.querySelectorAll('.phase-header');
            phaseHeaders.forEach(header => {
                let nextElement = header.nextElementSibling;
                let phaseHasVisibleItems = false;
                while (nextElement && nextElement.tagName === 'LI') {
                    if (!nextElement.classList.contains('hidden')) { phaseHasVisibleItems = true; break; }
                    nextElement = nextElement.nextElementSibling;
                }
                header.classList.toggle('hidden', !phaseHasVisibleItems);
            });
        });

        mediaCount.textContent = `(${visibleCount})`;
    });

    // --- INICIALIZACIÓN ---
    generateSidebar();
    generateGrid();
    animateGridIn(); // Llamada a la nueva animación de carga
    if (mediaList.length > 0) {
        handleSelect(mediaList[0].id);
    }
});