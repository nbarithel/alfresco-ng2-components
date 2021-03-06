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

import { browser } from 'protractor';
import LoginPage = require('../pages/adf/loginPage');
import ProcessServicesPage = require('../pages/adf/process_services/processServicesPage');
import ProcessFiltersPage = require('../pages/adf/process_services/processFiltersPage.js');
import { CommentsPage } from '../pages/adf/commentsPage';

import TestConfig = require('../test.config');
import resources = require('../util/resources');

import AlfrescoApi = require('alfresco-js-api-node');
import { UsersActions } from '../actions/users.actions';
import { AppsActions } from '../actions/APS/apps.actions';

describe('Comment component for Processes', () => {

    let loginPage = new LoginPage();
    let processServicesPage = new ProcessServicesPage();
    let processFiltersPage = new ProcessFiltersPage();
    let commentsPage = new CommentsPage();

    let app = resources.Files.SIMPLE_APP_WITH_USER_FORM;
    let user, tenantId, appId, processInstanceId, comment, taskComment, addedComment;

    beforeAll(async(done) => {
       this.alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

       done();
    });

    beforeEach(async(done) => {
        let apps = new AppsActions();
        let users = new UsersActions();

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        user = await users.createTenantAndUser(this.alfrescoJsApi);

        tenantId = user.tenantId;

        await this.alfrescoJsApi.login(user.email, user.password);

        let importedApp = await apps.importPublishDeployApp(this.alfrescoJsApi, app.file_location);
        appId = importedApp.id;

        let processWithComment = await apps.startProcess(this.alfrescoJsApi, 'Task App', 'Comment APS');
        processInstanceId = processWithComment.id;

        await loginPage.loginToProcessServicesUsingUserModel(user);

        done();
    });

    afterEach(async(done) => {
        await loginPage.loginToProcessServicesUsingUserModel(user);

        await this.alfrescoJsApi.activiti.modelsApi.deleteModel(appId);

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await this.alfrescoJsApi.activiti.adminTenantsApi.deleteTenant(tenantId);

        done();
    });

    it('[C260464] Should be able to add a comment on APS and check on ADF', () => {
        browser.controlFlow().execute(async() => {
            comment = {message: 'HELLO'};

            await this.alfrescoJsApi.activiti.commentsApi.addProcessInstanceComment(comment, processInstanceId);
        });

        processServicesPage.goToProcessServices().goToTaskApp().clickProcessButton();

        processFiltersPage.clickRunningFilterButton();
        processFiltersPage.selectFromProcessList('Comment APS');

        browser.controlFlow().execute(async() => {
            addedComment = await this.alfrescoJsApi.activiti.commentsApi.getProcessInstanceComments(processInstanceId, {'latestFirst': true});

            commentsPage.checkUserIconIsDisplayed(0);

            expect(commentsPage.getTotalNumberOfComments()).toEqual('Comments (' + addedComment.total + ')');
            expect(commentsPage.getMessage(0)).toEqual(addedComment.data[0].message);
            expect(commentsPage.getUserName(0)).toEqual(addedComment.data[0].createdBy.firstName + ' ' + addedComment.data[0].createdBy.lastName);
            expect(commentsPage.getTime(0)).toContain('ago');
        });
    });

    it('[C260465] Should not be able to view process comment on included task', () => {
        browser.controlFlow().execute(async() => {
            comment = {message: 'GOODBYE'};

            await this.alfrescoJsApi.activiti.commentsApi.addProcessInstanceComment(comment, processInstanceId);
        });

        processServicesPage.goToProcessServices().goToTaskApp().clickProcessButton();

        processFiltersPage.clickRunningFilterButton();
        processFiltersPage.selectFromProcessList('Comment APS');

        browser.controlFlow().execute(async() => {
            let taskQuery = await this.alfrescoJsApi.activiti.taskApi.listTasks({processInstanceId: processInstanceId});

            let taskId = taskQuery.data[0].id;

            let taskComments = await this.alfrescoJsApi.activiti.commentsApi.getTaskComments(taskId, {'latestFirst': true});
            expect(taskComments.total).toEqual(0);
        });
    });

    it('[C260466] Should be able to display comments from Task on the related Process', () => {
        browser.controlFlow().execute(async() => {
            let taskQuery = await this.alfrescoJsApi.activiti.taskApi.listTasks({processInstanceId: processInstanceId});

            let taskId = taskQuery.data[0].id;

            taskComment = {message: 'Task Comment'};

            await this.alfrescoJsApi.activiti.taskApi.addTaskComment(taskComment, taskId);
        });

        processServicesPage.goToProcessServices().goToTaskApp().clickProcessButton();

        processFiltersPage.clickRunningFilterButton();
        processFiltersPage.selectFromProcessList('Comment APS');

        browser.controlFlow().execute(async() => {
            let addedTaskComment = await this.alfrescoJsApi.activiti.commentsApi.getProcessInstanceComments(processInstanceId, {'latestFirst': true});

            commentsPage.checkUserIconIsDisplayed(0);

            expect(commentsPage.getTotalNumberOfComments()).toEqual('Comments (' + addedTaskComment.total + ')');
            expect(commentsPage.getMessage(0)).toEqual(addedTaskComment.data[0].message);
            expect(commentsPage.getUserName(0)).toEqual(addedTaskComment.data[0].createdBy.firstName + ' ' + addedTaskComment.data[0].createdBy.lastName);
            expect(commentsPage.getTime(0)).toContain('ago');
        });
    });
});
