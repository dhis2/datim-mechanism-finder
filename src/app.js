import 'jquery';
import angular from 'angular';

import 'normalize.css';
import './app.sass';

let developmentHeaders = {};
if (process.env.NODE_ENV === 'development') {
    developmentHeaders = require('../developmentHeaders.js');
}

function injectStyleSheet(stylesheetLink) {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', stylesheetLink);

    const head = document.querySelector('head');
    if (head) {
        head.appendChild(linkElement);
    }
}

function dhisDate() {
    return (value) => {
        if (/T([0-9]{2}:[0-9]{2}:[0-9]{2}).[0-9]{3}$/.test(value)) {
            return value.replace(/T([0-9]{2}\:[0-9]{2}\:[0-9]{2})\.[0-9]{3}$/, (match, time) => ` ${time}`);
        }

        return value;
    };
}

class WhereIsMyMechController {
    constructor($http, $scope, $location) {
        this.headerMap = {
            Date: 'Date',
            OperatingUnit: 'OU',
            FiscalYear: 'FY',
            PlanningReportingCycle: 'Reporting Cycle',
            HQMechanismID: 'HQ ID',
            LegacyMechanismID: 'Legacy ID',
            ImplementingMechanismName: 'IM',
            FundingAgency: 'Funding Agency',
            PrimePartner: 'Prime Partner',
            PrimePartnerID: 'Partner ID',
            StartDate: 'Start Date',
            EndDate: 'End Date',
            Active: 'Active'
        };

        this.myMechanismSearchString = '';
        this.api = $http;
        this.datimInfo = {};
        this.location = $location;

        $scope.$watch(() => this.myMechanismSearchString, (newVal, oldVal) => {
            if (newVal !== oldVal) {
                this.search();
            }
        });

        //Set the predefined search if we have one and run the search against the server
        if ($location.$$search.query) {
            this.myMechanismSearchString = $location.$$search.query;
            this.search();
        }
    }

    setSearchString(value) {
        this.myMechanismSearchString = value.replace(/\"/g, '').trim();
    }

    search() {
        //Reset found flags
        this.foundInDatim = false;
        this.foundInFactsInfo = false;
        this.datimInfo = {};

        this.location.search('query', this.myMechanismSearchString);

        this.api.get('https://sync.datim.org?search=' + this.myMechanismSearchString)
            .then(this.buildResultList.bind(this))
            .then(this.setResultList.bind(this))
            .then((resultList) => {
                if (resultList.length > 0) {
                    this.foundInFactsInfo = true;
                    return resultList[0];
                }
                return [];
            })
            .then(this.loadDATIMMechanism.bind(this));
    }

    buildResultList(response) {
        let lines = response.data;
        let headers = lines.shift();

        return {
            headers: headers,
            lines: lines
                .map(line => {
                    line[line.length - 1] =  parseInt(line[line.length - 1], 10);
                    return line;
                })
        };
    }

    setResultList(resultList) {
        if (!this.headers) {
            this.headers = resultList.headers;
        }
        this.resultList = resultList.lines;

        return this.resultList;
    }

    loadDATIMMechanism(firstRow) {
        if (firstRow) {
            this.datimMechanismCodeToSearch = firstRow[4];
        } else {
            this.datimMechanismCodeToSearch = this.myMechanismSearchString;
        }

        this.api.get('manifest.webapp')
            .then(response => {
                return response.data;
            })
            .then(manifest => {
                if (process.env.NODE_ENV === 'development') {
                    return 'https://dev.datim.org'
                }

                return manifest.activities.dhis.href;
            })
            .then(apiUrl => {
                injectStyleSheet(`${apiUrl}/dhis-web-commons/font-awesome/css/font-awesome.min.css`);

                return this.api.get([apiUrl, 'api', 'categoryOptions.json?filter=code:eq:' + this.datimMechanismCodeToSearch + '&fields=:owner,displayName,name,categories[:owner],categoryOptionCombos[:owner],categoryOptionGroups[:owner],organisationUnits[:owner]'].join('/'));
            })
            .then(response => response.data.categoryOptions[0])
            .then(categoryOption => {
                if (categoryOption) {
                    this.foundInDatim = true;
                    this.datimInfo.mechanism = categoryOption;
                }

                if (categoryOption && categoryOption.categoryOptionGroups.length > 0) {
                    this.datimInfo.agency = categoryOption.categoryOptionGroups.filter(categoryOptionGroup => /^Agency_.+/.test(categoryOptionGroup.code)).reduce((current) => current);
                    this.datimInfo.partner = categoryOption.categoryOptionGroups.filter(categoryOptionGroup => /^Partner_.+/.test(categoryOptionGroup.code)).reduce((current) => current);
                }
            })
            .catch(error => {
                console.error(error);
            });

    }
}


angular.module('whereIsMyMech', [])
    .config($httpProvider => {
        if (process.env.NODE_ENV === 'development') {
            $httpProvider.interceptors.push(($q) => {
                return {
                    request(config) {
                        if (config.url && /^https:\/\/dev.datim.org/.test(config.url)) {
                            config.headers = Object.assign({}, config.headers, developmentHeaders);
                        }
                        return config;
                    },
                };
            });
        }
    })
    .controller('WhereIsMyMechController', WhereIsMyMechController)
    .filter('dhisDate', dhisDate);


function initMenu() {
    return jQuery.getJSON('manifest.webapp')
}

initMenu()
    .then(() => angular.bootstrap(document.querySelector('html'), ['whereIsMyMech']))
    .catch(() => window.console.log('Failed to bootstrap the app'));
