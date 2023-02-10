const shared = require('../../shared/shared');

function getChromeLanguage() {
  const chromeLanguage = Cypress.env('CHROME_LANGUAGE');
  if (chromeLanguage === undefined) {
    return 'en';
  }
  return chromeLanguage;
}
const chromeLanguage = getChromeLanguage();

describe('L10N cypress tests', shared.defaultTestOptions, () => {
  beforeEach(() => {
    cy.intercept(
      `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env(
        'API_VERSION'
      )}/datasource/ws/data`
    ).as('pageloadSystem');
    cy.intercept(
      `${Cypress.env('BVD_CONTEXT_ROOT')}/rest/${Cypress.env(
        'API_VERSION'
      )}/pages/toc*`
    ).as('pageloadUser');
    cy.bvdLogin();
  });

  describe(
    'L10n Verification of Label, Values ,Widget Title, Messages',
    shared.defaultTestOptions,
    () => {
      const languageMap = new Map([
        [
          'en',
          {
            pageTitle: 'Localization',
            menuTitle: 'Administration',
            categoryDashboardAndReport: 'Dashboards & Reports',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: 'Refresh',
            pageMenuActionEdit: 'Edit',
            pageMenuActionDuplicate: 'Duplicate',
            pageMenuActionRemove: 'Remove',
            menuSearch: 'Search menu',
            widgetTitle: 'Hosts (translated title)',
            tableTitle: 'Table',
            label: 'Boeblingen',
            labelHeader: 'Localization (translated)',
            labelValue: 'Amount (translated)',
            about: 'About',
            aboutRelease: 'Release',
            aboutTitle: 'OPTIC One',
            aboutDescription: 'No content packs have been installed yet.',
            errorMessage:
              'Please contact your administrator if you believe that this should not happen.'
          }
        ],
        [
          'de',
          {
            pageTitle: 'Localization',
            menuTitle: 'Verwaltung',
            categoryDashboardAndReport: 'Dashboards und Berichte',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: 'Aktualisieren',
            pageMenuActionEdit: 'Bearbeiten',
            pageMenuActionDuplicate: 'Duplizieren',
            pageMenuActionRemove: 'Remove',
            menuSearch: 'Menü „Suchen“',
            widgetTitle: 'Wirte (übersetzter Titel)',
            tableTitle: 'Tabelle',
            label: 'Boeblingen',
            labelHeader: 'Location (übersetzt)',
            labelValue: 'Anzahl (übersetzt)',
            about: 'Info',
            aboutRelease: 'Release',
            aboutTitle: 'Servicesicherheit',
            aboutDescription: 'Es wurden noch keine Content Packs installiert.',
            errorMessage:
              'Wenden Sie sich an den Administrator, wenn Sie der Meinung sind, dass dies nicht geschehen sollte.'
          }
        ],
        [
          'es',
          {
            pageTitle: 'Localization',
            menuTitle: 'Administración',
            categoryDashboardAndReport: 'Paneles e informes',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: 'Actualizar',
            pageMenuActionEdit: 'Editar',
            pageMenuActionDuplicate: 'Duplicar',
            pageMenuActionRemove: 'Remove',
            menuSearch: 'Menú de búsqueda',
            widgetTitle: 'Anfitriones (título traducido)',
            tableTitle: 'Mesa',
            label: 'Boeblingen',
            labelHeader: 'Localización (traducido)',
            labelValue: 'Importe (traducido)',
            about: 'Acerca de',
            aboutRelease: 'Liberar',
            aboutTitle: 'Garantía del servicio',
            aboutDescription: 'Todavía no se ha instalado ningún paquete de contenido.',
            errorMessage:
              'Póngase en contacto con su administrador si se trata de un comportamiento anómalo.'
          }
        ],
        [
          'ru',
          {
            pageTitle: 'Localization',
            menuTitle: 'Администрирование',
            categoryDashboardAndReport: 'Dashboards and Reports',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: 'Обновить',
            pageMenuActionEdit: 'Изменить',
            pageMenuActionDuplicate: 'Дублировать',
            pageMenuActionRemove: 'Удалить',
            menuSearch: 'Меню поиска',
            widgetTitle: 'Хозяева (переведенное название)',
            tableTitle: 'Стол',
            label: 'Boeblingen',
            labelHeader: 'Локализация (перевод)',
            labelValue: 'Сумма (в переводе)',
            about: 'О программе',
            aboutRelease: 'Релиз',
            aboutTitle: 'Интерфейс гарантии обслуживания',
            aboutDescription: 'No content packs have been installed yet.',
            errorMessage:
              'Обратитесь к администратору, если вы считаете, что это ошибка.'
          }
        ],
        [
          'fr',
          {
            pageTitle: 'Localization',
            menuTitle: 'Administration',
            categoryDashboardAndReport: 'Tableaux de bord et rapports',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: 'Actualiser',
            pageMenuActionEdit: 'Modifier',
            pageMenuActionDuplicate: 'Dupliquer',
            pageMenuActionRemove: 'Supprimer',
            menuSearch: 'Menu de recherche',
            widgetTitle: 'Hosts (translated title)',
            tableTitle: 'Table',
            label: 'Boeblingen',
            labelHeader: 'Localization (translated)',
            labelValue: 'Amount (translated)',
            about: 'À propos de',
            aboutRelease: 'Version',
            aboutTitle: 'Assurance Service',
            aboutDescription: 'Aucun pack de contenu n’a encore été installé.',
            errorMessage:
              'Veuillez contacter votre administrateur si vous pensez que cela ne devrait pas se produire.'
          }
        ],
        [
          'ja',
          {
            pageTitle: 'Localization',
            menuTitle: '管理',
            categoryDashboardAndReport: 'ダッシュボードおよびレポート',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: '更新',
            pageMenuActionEdit: '編集',
            pageMenuActionDuplicate: '複製',
            pageMenuActionRemove: '削除',
            menuSearch: '検索メニュー',
            widgetTitle: 'ホスト (翻訳されたタイトル)',
            tableTitle: 'テーブル',
            label: 'Boeblingen',
            labelHeader: 'ローカリゼーション（翻訳済み）',
            labelValue: '金額（換算）',
            about: 'バージョン情報',
            aboutRelease: 'リリース',
            aboutTitle: 'サービスアシュアランス',
            aboutDescription: 'コンテンツパックはまだインストールされていません。',
            errorMessage:
              'これは通常発生しないと思われる場合は、管理者にお問い合わせください。'
          }
        ],
        [
          'ko',
          {
            pageTitle: 'Localization',
            menuTitle: '관리',
            categoryDashboardAndReport: '대시보드 및 보고서',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: '새로 고침',
            pageMenuActionEdit: '편집',
            pageMenuActionDuplicate: '복제',
            pageMenuActionRemove: '제거',
            menuSearch: '검색 메뉴',
            widgetTitle: '호스트(번역된 제목)',
            tableTitle: '테이블',
            label: 'Boeblingen',
            labelHeader: '현지화(번역)',
            labelValue: '금액(번역)',
            about: '정보',
            aboutRelease: '릴리스',
            aboutTitle: '서비스 보증',
            aboutDescription: '컨텐츠 팩이 아직 설치되지 않았습니다.',
            errorMessage: '문제가 되는 경우 관리자에게 문의하십시오.'
          }
        ],
        [
          'zh-cn',
          {
            pageTitle: 'Localization',
            menuTitle: '管理',
            categoryDashboardAndReport: '控制面板和报告',
            yAxisLabel: 'Count',
            xAxisLabel: 'Percent',
            chartWidgetLegend: 'CPU Utilization (avg):',
            graphDisplayName: 'Average CPU Utilization - Dual axis Chart',
            pageMenuActionRefresh: '刷新',
            pageMenuActionEdit: '编辑',
            pageMenuActionDuplicate: '复制',
            pageMenuActionRemove: '移除',
            menuSearch: '搜索菜单',
            widgetTitle: '主持人（翻译标题）',
            tableTitle: '桌子',
            label: 'Boeblingen',
            labelHeader: '本地化（翻译）',
            labelValue: '金额（翻译）',
            about: '关于',
            aboutRelease: '发布',
            aboutTitle: '服务保证',
            aboutDescription: '尚未安装内容包。',
            errorMessage: '如果您认为不应发生这种情况，请与管理员联系。'
          }
        ]
      ]);

      const specificLanguage = languageMap.get(chromeLanguage) ?
        languageMap.get(chromeLanguage) :
        'en';

      it('Validate localization Text Side Nav SearchBar', () => {
        cy.visit(`/allChartsPage`);
        cy.bvdSideNavClick('navigation-category-T2');
        cy.get('[data-cy=sideNavigation-search-input]').should('be.visible');
        cy.get('[data-cy=firstLevelItem-1_L0_SA_Administration]').should('be.visible').contains(specificLanguage.menuTitle).click();
        cy.get(`[placeholder='${specificLanguage.menuSearch}']`);
        cy.get('[data-cy=secondLevelItem-0_L1_SA_AdminDashboards]').should('be.visible').contains(specificLanguage.categoryDashboardAndReport);
        cy.get('#average_cpu_chart_mixed [data-cy="echarts-legend-volume: host_name: vdb.mambo.net"]').scrollIntoView();
        cy.get('[id^=average_cpu_dualaxis]').should('be.visible').contains(specificLanguage.graphDisplayName);
        cy.get('#average_cpu_dualaxis .legend-name > [data-cy="legend-title-CPU Utilization (avg): host_name: vdb.mambo.net"]').should('be.visible').contains(specificLanguage.chartWidgetLegend);
        cy.get('[id^=leftAxisLabel-average_cpu_dualaxis]').should('be.visible').contains(specificLanguage.yAxisLabel);
        cy.get('[id^="rightAxisLabel-average_cpu_dualaxis"]').should('be.visible').contains(specificLanguage.xAxisLabel);
        cy.visit(`/uiTestLocalization`);
        cy.get('[data-cy=breadcrumb-title-Localization]').should('be.visible').contains(specificLanguage.pageTitle);
        cy.get('.dashboard-widget-title-bar').should('be.visible').contains(specificLanguage.widgetTitle);
        cy.get('.dashboard-widget-title-bar').should('be.visible').contains(specificLanguage.tableTitle);
        cy.get('tbody > [tabindex="0"] ').should('be.visible').contains(specificLanguage.label);
        cy.get('[data-cy="table-header-localization.table.label.location"]').should('be.visible').contains(specificLanguage.labelHeader);
        cy.get('[data-cy="table-header-localization.table.label.amount"]').should('be.visible').contains(specificLanguage.labelValue);
        cy.get('[data-cy=action-button]').eq(0).should('be.visible').click();
        cy.get('[data-cy=action-button-edit] > .dropdown-menu-text').should('be.visible').contains(specificLanguage.pageMenuActionEdit);
        cy.get('[data-cy=action-button-removeWidget] > .dropdown-menu-text').should('be.visible').contains(specificLanguage.pageMenuActionRemove);
        cy.get('[data-cy=action-button-duplicateWidget] > .dropdown-menu-text').should('be.visible').contains(specificLanguage.pageMenuActionDuplicate);
        cy.get('[data-cy=action-button-refreshWidget] > .dropdown-menu-text').should('be.visible').contains(specificLanguage.pageMenuActionRefresh).click();
        cy.get('[data-cy="help-button"]').click();
        cy.get('[data-cy=aboutDialog] > .dropdown-menu-text').should('be.visible').contains(specificLanguage.about).click();
        cy.get('[data-cy=suiteRelease]').should('be.visible').contains(specificLanguage.aboutRelease);
        if (Cypress.env('TestEnvironment') === 'development') {
          cy.get('[data-cy=suiteName]').should('be.visible').contains(specificLanguage.aboutTitle);
          cy.get('[data-cy=appDescription]').should('be.visible').contains(specificLanguage.aboutDescription);
        }
      });
    }
  );
});
