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

import AdfLoginPage = require('./pages/adf/loginPage.js');
import TasksPage = require('./pages/adf/process_services/tasksPage.js');
import ViewerPage = require('./pages/adf/viewerPage.js');
import UsingWidget = require('./pages/adf/process_services/widgets/usingWidget.js');
import ProcessServicesPage = require('./pages/adf/process_services/processServicesPage.js');

import CONSTANTS = require('./util/constants');

import Tenant = require('./models/APS/Tenant');
import FileModel = require('./models/ACS/fileModel.js');
import User = require('./models/APS/User');
import AppPublish = require('./models/APS/AppPublish');

import TestConfig = require('./test.config.js');
import resources = require('./util/resources.js');

import users = require('./restAPI/APS/reusableActions/users');
import apps = require('./restAPI/APS/reusableActions/apps');
import AlfrescoApi = require('alfresco-js-api-node');

describe('Start Task - Task App', () => {

    let adfLoginPage = new AdfLoginPage();
    let viewerPage = new ViewerPage();
    let usingWidget = new UsingWidget();
    let processServicesPage = new ProcessServicesPage();
    let taskPage = new TasksPage();

    let alfrescoJsApi, processUserModel, appModel, modelId;
    let app = resources.Files.WIDGETS_SMOKE_TEST;
    let pdfFile = new FileModel({ 'name': resources.Files.ADF_DOCUMENTS.PDF.file_name });
    let appFilds = app.form_fields;

    beforeAll(async (done) => {
        this. alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        processUserModel = await users.createTenantAndUser(this.alfrescoJsApi);

        await this.alfrescoJsApi.login(processUserModel.email, processUserModel.password);

        await apps.importPublishDeployApp(this.alfrescoJsApi, app.file_location);

        await adfLoginPage.loginToProcessServicesUsingUserModel(processUserModel);

        done();
    });

    afterAll(async (done) => {
        this. alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await users.createTenantAndUser(this.alfrescoJsApi, processUserModel.tenantId);

        done();
    });

    it('[C274690] Task List attachment - View file', () => {
        processServicesPage.goToProcessServices().goToTaskApp().clickTasksButton();

        taskPage.usingFiltersPage().goToFilter(CONSTANTS.TASKFILTERS.MY_TASKS);

        taskPage.createNewTask()
            .addName('View file')
            .addForm(app.formName)
            .clickStartButton()
            .then(() => {
                usingWidget.usingAttachFileWidget().attachFile(appFilds.attachfile_id, pdfFile.location);
                usingWidget.usingAttachFileWidget().checkFileIsAttached(appFilds.attachfile_id, pdfFile.name);

                usingWidget.usingAttachFileWidget().viewFile(pdfFile.name);
                viewerPage.checkFileContent('1', pdfFile.firstPageText);
                viewerPage.checkCloseButtonIsDisplayed();
                viewerPage.clickCloseButton();
                taskPage.usingTasksListPage().checkTaskIsDisplayedInTasksList('View file');
            });
    });

});