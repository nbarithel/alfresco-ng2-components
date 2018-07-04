/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import LoginPage = require('./pages/adf/loginPage');
import TrashcanPage = require('./pages/adf/trashcanPage');
import PaginationPage = require('./pages/adf/paginationPage');
import NavigationBarPage = require('./pages/adf/navigationBarPage');

import AcsUserModel = require('./models/ACS/acsUserModel');
import FolderModel = require('./models/ACS/folderModel');

import TestConfig = require('./test.config');
import Util = require('./util/util');

import AlfrescoApi = require('alfresco-js-api-node');
import { UploadActions } from './actions/ACS/upload.actions';

describe('Trashcan - Pagination', () => {
    let pagination = {
        base: 'newFile',
        extension: '.txt'
    };

    let itemsPerPage = {
        five: '5',
        fiveValue: 5,
        ten: '10',
        tenValue: 10,
        fifteen: '15',
        fifteenValue: 15,
        twenty: '20',
        twentyValue: 20,
        default: '25'
    };

    let loginPage = new LoginPage();
    let trashcanPage = new TrashcanPage();
    let paginationPage = new PaginationPage();
    let navigationBarPage = new NavigationBarPage();

    let acsUser = new AcsUserModel();
    let newFolderModel = new FolderModel({'name': 'newFolder'});
    let nrOfFiles = 20;

    beforeAll(async (done) => {
        let uploadActions = new UploadActions();

        let fileNames = Util.generateSeqeunceFiles(10, nrOfFiles + 9, pagination.base, pagination.extension);

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        let folderUploadedModel = await uploadActions.uploadFolder(this.alfrescoJsApi, newFolderModel.name, '-my-');

        let emptyFiles = await uploadActions.createEmptyFiles(this.alfrescoJsApi, fileNames, folderUploadedModel.entry.id);

        emptyFiles.list.entries.forEach( (node) => {
            this.alfrescoJsApi.node.deleteNode(node.entry.id);
        });

        done();
    });

    xit('[C272811] 20 Items per page', () => {
        navigationBarPage.clickTrashcanButton();

        trashcanPage.waitForTableBody();

        paginationPage.selectItemsPerPage(itemsPerPage.twenty);

        trashcanPage.waitForTableBody();
        trashcanPage.waitForPagination();

        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.twenty);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + nrOfFiles + ' of ' + nrOfFiles);
        expect(trashcanPage.numberOfResultsDisplayed()).toBe(nrOfFiles);

        paginationPage.checkNextPageButtonIsDisabled();
        paginationPage.checkPreviousPageButtonIsDisabled();
    });

    xit('[C276742] 15 Items per page', () => {
        navigationBarPage.clickTrashcanButton();
        trashcanPage.waitForTableBody();
        paginationPage.selectItemsPerPage(itemsPerPage.fifteen);
        trashcanPage.waitForTableBody();
        trashcanPage.waitForPagination();
        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.fifteen);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fifteenValue + ' of ' + nrOfFiles);
        expect(trashcanPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fifteenValue);
        paginationPage.checkNextPageButtonIsEnabled();
        paginationPage.checkPreviousPageButtonIsDisabled();
    });

    xit('[C276743] 10 Items per page', () => {
        navigationBarPage.clickTrashcanButton();
        trashcanPage.waitForTableBody();
        paginationPage.selectItemsPerPage(itemsPerPage.ten);
        trashcanPage.waitForTableBody();
        trashcanPage.waitForPagination();
        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.ten);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.tenValue + ' of ' + nrOfFiles);
        expect(trashcanPage.numberOfResultsDisplayed()).toBe(itemsPerPage.tenValue);
        paginationPage.checkNextPageButtonIsEnabled();
        paginationPage.checkPreviousPageButtonIsDisabled();
    });

    xit('[C276744] 5 Items per page', () => {
        navigationBarPage.clickTrashcanButton();
        trashcanPage.waitForTableBody();
        paginationPage.selectItemsPerPage(itemsPerPage.five);
        trashcanPage.waitForTableBody();
        trashcanPage.waitForPagination();
        expect(paginationPage.getCurrentItemsPerPage()).toEqual(itemsPerPage.five);
        expect(paginationPage.getPaginationRange()).toEqual('Showing 1-' + itemsPerPage.fiveValue + ' of ' + nrOfFiles);
        expect(trashcanPage.numberOfResultsDisplayed()).toBe(itemsPerPage.fiveValue);
        paginationPage.checkNextPageButtonIsEnabled();
        paginationPage.checkPreviousPageButtonIsDisabled();
    });
});
