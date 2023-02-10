module.exports = {

  page: {
    id: 'testPage',
    title: 'testPage',
    tags: [{
      name: '__system', values: ['read']
    }],
    default: true,
    activation: {
      contextType: ['host']
    },
    view: {
      id: 'page_1_main',
      views: [
        {
          id: 'average_cpu_chart_component_ec',
          layout: {
            colSpan: 6,
            rowSpan: 2,
            resizable: true
          },
          options: {
            title: 'Average1',
            config: {
              graph: [
                {
                  type: 'bar',
                  name: 'cpuload_chart'
                }
              ]
            }
          }
        }
      ]
    }
  },

  menuEntry: {
    title: 'MenuEntryLimitedByTags',
    categoryId: 'TagsLimit',
    pageId: 'testPage'
  },

  pages: [
    {
      id: 'testPage1',
      title: 'Test Page 1',
      default: true,
      categoryId: '1',
      activation: {
        contextType: [
          'host'
        ]
      },
      view: {
        id: 'page_1_main',
        views: []
      }
    },
    {
      id: 'testPage2',
      title: 'Test Page 2',
      categoryId: '3',
      activation: {
        contextType: [
          'application'
        ]
      },
      view: {
        id: 'page_1_main',
        views: []
      }
    },
    {
      id: 'testPage3',
      title: 'Test Page 3',
      categoryId: '1',
      activation: {
        predicate: {
          composition: 'all',
          definitions: [
            {
              operation: 'equals',
              path: '$.type',
              value: 'HOST',
              ignoreCase: true
            }
          ]
        }
      },
      view: {
        id: 'page_1_main',
        views: []
      }
    },
    {
      id: 'testPage4',
      title: 'Test Page 4',
      categoryId: '3',
      activation: {
        predicate: {
          definitions: [
            {
              operation: 'in',
              path: '$.type',
              value: ['APPLICATION', 'NODE'],
              ignoreCase: true
            }
          ]
        }
      },
      view: {
        id: 'page_1_main',
        views: []
      }
    },
    {
      id: 'testPage5',
      title: 'Test Page 5',
      categoryId: '2',
      view: {
        id: 'page_1_main',
        views: []
      },
      tags: [
        {
          name: '__system',
          values: [
            'nom_express',
            'nom_ultimate'
          ]
        }
      ]
    }
  ],

  widget: {
    id: 'page_1_main_test',
    type: 'mashup',
    options: {
      dashboardOptions: {
        columns: 12,
        rowHeight: 220
      }
    }
  },

  widgets: [
    {
      id: 'widget_1_test',
      type: 'mashup',
      options: {
        dashboardOptions: {
          columns: 12,
          rowHeight: 220
        }
      }
    },
    {
      id: 'widget_2_test',
      type: 'external',
      options: {
        activation: {
          contextType: [
            'host'
          ]
        },
        dashboardOptions: {
          columns: 12,
          rowHeight: 220
        }
      }
    }
  ],

  category: {
    id: 'testCategory',
    icon: 'hpe-globe',
    abbreviation: 'O',
    title: 'test_Operations'
  },

  categories: [
    {
      id: '1',
      icon: 'hpe-globe',
      abbreviation: 'O',
      title: 'Operations'
    },
    {
      id: '2',
      icon: 'hpe-admin',
      abbreviation: 'A',
      title: 'Administration'
    },
    {
      id: '3',
      parent: '1',
      abbreviation: '',
      title: 'Network'
    }
  ],

  appConfig: {
    app: {
      id: 'MyApp',
      options: {
        showContext: true,
        showTimeFrame: true
      },
      l10n: {
        baseUrl: '{EXPLORE_CONTEXT_ROOT}/externalcomponents/externalL10n/',
        prefix: 'externalL10n_',
        suffix: '.json'
      },
      helpUrl: 'https://software.microfocus.com/en-us/products/operations-bridge-suite/overview',
      title: 'BVD Explore Page',
      titleL10n: 'application.title',
      excludeTags: ['dev', 'test']
    },
    context: [],
    timeIntervals: {
      fiveMinutes: '4s',
      fifteenMinutes: '10s'
    }
  },
  updateAppConfig: {
    app: {
      id: 'NewApp',
      title: 'BVD Explore Page'
    },
    context: []
  },
  additionalAppConfig: {
    app: {
      id: 'SecondAppConfig',
      options: {
        showContext: true,
        showTimeFrame: true
      },
      title: 'BVD Explore Page',
      titleL10n: 'application.title'
    },
    context: []
  },

  tags: [
    {
      name: '__system',
      value: 'read',
      ref: 'testPage',
      refType: 'page'
    },
    {
      name: '__system',
      value: 'write',
      ref: 'testPage',
      refType: 'page'
    },
    {
      name: '__licenses',
      value: 'licenseA',
      ref: 'testPage',
      refType: 'page'
    }
  ],

  pageGroup: {
    name: 'pagegroup_test_one',
    description: 'creating page group test one'
  },

  pageGroups: [
    {
      name: 'pagegroup_test_two',
      description: 'creating page group test two'
    },
    {
      name: 'pagegroup_test_three',
      description: 'creating page group test three'
    }
  ],

  menuEntries: [
    {
      title: 'menuEntry_test_one',
      pageId: 'Operation',
      context: {
        items: [
          {
            id: '1',
            type: 'host',
            name: 'loadgen.mambo.net',
            extra: {}
          }
        ],
        start: '2020-06-05 17:20:43.18+05:30',
        end: '2020-06-05 17:20:43.18+05:30'
      },
      categoryId: 'operations'
    },
    {
      title: 'menuEntry_test_two',
      pageId: 'testing',
      context: {
        items: [
          {
            id: '2',
            type: 'host',
            name: 'omidock.mambo.net',
            extra: {}
          }
        ],
        start: '2020-06-05 17:20:43.18+05:30',
        end: '2020-06-05 17:20:43.18+05:30'
      },
      categoryId: 'UI Testing'
    }
  ],

  role: {
    name: 'NOM_View_Role',
    description: 'Test role for foundation',
    permission: []
  },

  invalidRole: {
    name: 'bvdRole 1',
    description: 'Test invalid role name',
    permission: []
  },

  roleWithPermission: {
    name: 'NOM_View_Role_1',
    description: 'Test FullControl Permission',
    permission: [{
      // eslint-disable-next-line camelcase
      operation_key: 'FullControl',
      // eslint-disable-next-line camelcase
      resource_key: 'menu<>All'
    }]
  },

  roleWithActionPermission: {
    name: 'NOM_View_Role_2',
    description: 'Default action  and menu entry role for foundation',
    permission: []
  },

  plugin: {
    id: 'testPlugin',
    type: 'action'
  },

  settings: [
    {
      id: 'tz',
      label: {
        l10n: 'timezone.label',
        default: 'Timezone'
      },
      description: {
        l10n: 'timezone.description',
        default: 'Specify timezone value'
      },
      scope: {
        l10n: 'timezone.scope',
        default: 'General settings'
      },
      section: 'Date & Time',
      defaultValue: { value: 'UTC' },
      options: { type: 'string' }
    },
    {
      id: 'dateFormat',
      label: {
        l10n: 'dateFormat.label',
        default: 'Date Format'
      },
      description: {
        l10n: 'dateFormat.description',
        default: 'Specify date format value'
      },
      scope: 'General settings',
      section: {
        l10n: 'dateFormat.section',
        default: 'Date & Time'
      },
      defaultValue: { value: 'DD-MM-YYYY' },
      options: { type: 'date' }
    }
  ]
};
