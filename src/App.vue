<template>
  <div id="app">
    <loading :active.sync="report_is_loading"
        :can-cancel="false"
        :is-full-page="true"></loading>
    <div class="progress-info" v-show="report_is_loading">
      <span class="progress-info-job">{{active_job}}:</span>
      <span class="progress-info-done">{{active_job_done}}</span>%
    </div>
    <div id="workarea">
      <div id="sidebar">
        <div class="sidebar-block">
          <div class="sidebar-block-inner">
            <form name="meeting_filter">
              <div class="filter-block-title">Filters</div>
              <div class="menu-filter-block">
                <div class="filter-field">
                  <label class="filter-field-title">Invoiced TC</label>
                  <select class="filter-dropdown" v-model="filter_invoiced_tc">
                    <option value="-1">any</option>
                    <option value="1">yes</option>
                    <option value="0">no</option>
                  </select>
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Company</label>
                  <v-autocomplete
                    :items="filter_company_items"
                    @update-items="updateCompanyItems"
                    @focus="updateCompanyItems"
                    @input="selectCompanyItem"
                    :min-len=0
                    :component-item='filter_items_template'
                    :get-label="getTitle"
                    :disabled="filter_disable_company"
                    v-model="filter_company_item"
                  ></v-autocomplete>
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Contact</label>
                  <v-autocomplete
                    :items="filter_client_items"
                    @update-items="updateClientItems"
                    @focus="updateClientItems"
                    @input="selectClientItem"
                    :min-len=0
                    :component-item='filter_items_template'
                    :get-label="getFIO"
                    :disabled="filter_disable_client"
                    v-model="filter_client_item"
                  ></v-autocomplete>
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Deal</label>
                  <v-autocomplete
                    :items="filter_deal_items"
                    @update-items="updateDealItems"
                    @focus="updateDealItems"
                    @input="selectDealItem"
                    :min-len=0
                    :component-item='filter_items_template'
                    :get-label="getTitle"
                    v-model="filter_deal_item"
                  ></v-autocomplete>
                </div>

                <!-- <div class="filter-field">
                  <label class="filter-field-title">Task</label>
                  <v-autocomplete
                    :items="filter_task_items"
                    @update-items="updateTaskItems"
                    @focus="updateTaskItems"
                    @input="selectTaskItem"
                    :min-len=4
                    :component-item='filter_items_template'
                    :get-label="getTitle"
                    v-model="filter_task_item"
                  ></v-autocomplete>
                </div> -->

                <div class="filter-field">
                  <label class="filter-field-title">Date from</label>
                  <span class="webform-field-textbox-inner">
                    <input type="date" class="webform-field-textbox" v-model="completed_from">
                  </span>
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Date to</label>
                  <span class="webform-field-textbox-inner">
                    <input type="date" class="webform-field-textbox" v-model="completed_to">
                  </span>
                </div>

                <div class="filter-field months">
                  <input type="button" value="Last 3 month" v-on:click="setFilterToLast3Month" />
                  <input type="button" value="Last month" v-on:click="setFilterToLastMonth" />
                  <input type="button" value="This month" v-on:click="setFilterToThisMonth" />
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Created by</label>
                  <v-autocomplete
                    :items="filter_user_items"
                    @update-items="updateUserItems"
                    @focus="updateUserItems"
                    @input="selectUserItem"
                    :min-len=0
                    :component-item='filter_items_template'
                    :get-label="getFIO"
                    v-model="filter_user_item"
                  ></v-autocomplete>
                </div>
              </div>

              <div class="filter-field" v-popover:join-popover.left>
                <input id="usejoin" type="checkbox" v-model="use_join"/>
                <label class="filter-field-title" for="usejoin" style="display: inline-block">Compact view</label>
              </div>
              <popover name="join-popover" event="hover" :delay="500" :pointer="false" width="200">
                <p>Rows with the same employee, task, date and comment will be merged.</p>
                <p><b>Warning:</b> to apply merging, checkbox should be selected before report generate.</p>
              </popover>

              <div class="filter-field-buttons">
                <input
                  type="button"
                  class="filter-submit btn-invoiced-comment"
                  v-on:click="showHideInvoicedTCComment"
                  :value='show_invoiced_comment ? "Hide task Invoiced TC" : "Show task Invoiced TC"'
                >
                <input
                  style="_display: none"
                  type="button"
                  class="filter-submit btn-invoiced-comment"
                  v-on:click="markAsInvoicedTC"
                  :disabled="!report_exist"
                  value="Mark all tasks as Invoiced TC"
                >
                <input
                  type="button"
                  class="filter-submit btn-apply"
                  v-on:click="generateReport"
                  value="Apply"
                >
                <input
                  type="button"
                  class="filter-submit btn-clean"
                  v-on:click="cleanReport"
                  value="Clean"
                >
                <br/>
                <input
                  type="button"
                  class="filter-submit btn-export"
                  v-on:click="exportReport"
                  value="Export"
                >
              </div>
            </form>

            <form name="meeting_filter">
              <div class="filter-block-title">Rates</div>
              <div class="menu-filter-block">
                <div class="filter-field">
                  <input id="userates" type="checkbox" v-model="use_rates" />
                  <label class="filter-field-title" for="userates" style="display: inline-block">Use rates</label>
                </div>

                <div class="filter-field">
                  <label class="filter-field-title">Tariff</label>
                  <select class="filter-dropdown" v-model="current_rate">
                    <option value="0">BY 2022 (150)</option>
                    <option value="1">BY 2019 Standard (120)</option>
                    <option value="2">BY Old (100)</option>
                    <option value="3">BY Internal Rates</option>
                  </select>
                </div>

                <div class="filter-field">
                  <span class="rate-value">{{getRate('Trainee')}}</span>
                  <span class="rate-name">Trainee</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Assistant')}}</span>
                  <span class="rate-name">Assistant</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Associate')}}</span>
                  <span class="rate-name">Associate</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Legal Assistant')}}</span>
                  <span class="rate-name">Legal Assistant</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Business Support Manager')}}</span>
                  <span class="rate-name">Business Support Manager</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Senior Counsel')}}</span>
                  <span class="rate-name">Senior Counsel</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Partner')}}</span>
                  <span class="rate-name">Partner</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Associate Partner')}}</span>
                  <span class="rate-name">Associate Partner</span>
                </div>
                <div class="filter-field">
                  <span class="rate-value">{{getRate('Senior Counsel, Attorney-at-law')}}</span>
                  <span class="rate-name">Senior Counsel, Attorney-at-law</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div id="workarea-content">
        <div class="workarea-content-paddings">
          <table cellspacing="0" class="reports-list-table" id="report-users">
            <thead>
              <th class="reports-first-column reports-head-cell-top">Employee</th>
              <th class="reports-head-cell reports-head-cell-top">Position</th>
              <th class="reports-head-cell reports-head-cell-top">Time elapsed</th>
              <th v-if="use_rates" class="reports-head-cell reports-head-cell-top">Rate</th>
              <th v-if="use_rates" class="reports-head-cell reports-head-cell-top">Amount</th>
            </thead>
            <tbody>
              <tr v-for="(user, i) in report.users_rows" v-bind:key="i" class="reports-list-item">
                <td class="report-row reports-first-column">{{user.name}}</td>
                <td class="report-row">{{user.position}}</td>
                <td class="report-row">{{user.total}}</td>
                <td v-if="use_rates" class="report-row">{{user.rate}}</td>
                <td v-if="use_rates" class="report-row">{{user.amount}}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="report-total">
                <td class="reports-first-column reports-head-cell-top"></td>
                <td class="reports-head-cell reports-head-cell-top">Total:</td>
                <td class="reports-head-cell reports-head-cell-top">{{report.total}}</td>
                <td v-if="use_rates" class="reports-head-cell reports-head-cell-top"></td>
                <td v-if="use_rates" class="reports-head-cell reports-head-cell-top">{{report.total_amount}}</td>
              </tr>
            </tfoot>
          </table>

          <h2>Specification</h2>
          <table cellspacing="0" class="reports-list-table" id="report-spec">
            <thead>
              <th class="reports-first-column reports-head-cell-top">Date</th>
              <th class="reports-head-cell reports-head-cell-top">Employee</th>
              <th class="reports-head-cell reports-head-cell-top">Task</th>
              <th class="reports-head-cell reports-head-cell-top">Comment</th>
              <th class="reports-head-cell reports-head-cell-top">Time elapsed</th>
            </thead>
            <tbody>
              <tr v-for="(row, i) in report.rows" v-bind:key="i" class="reports-list-item">
                <td class="report-deal reports-first-column" v-if="row.type==='header'">Deal:</td>
                <td class="report-deal" colspan="4" v-if="row.type==='header'">
                  <a target="_blank" :href="getDealUrl(row.deal_id)">{{row.title}}</a>
                </td>
                <td class="report-row reports-first-column" v-if="row.type==='item'">{{row.date}}</td>
                <td class="report-row" v-if="row.type==='item'">{{row.user}}</td>
                <td class="report-row" v-if="row.type==='item'">
                  <a target="_blank" :href="getTaskUrl(row.task_id)">{{row.task}}</a>
                </td>
                <td class="report-row" v-if="row.type==='item'">
                  <b v-if="row.invoiced_tc && show_invoiced_comment">Invoiced TC</b>
                  {{row.comment}}
                </td>
                <td class="report-row" v-if="row.type==='item'">{{row.time}}</td>
                <td
                  class="report-subtotal reports-first-column"
                  colspan="4"
                  v-if="row.type==='footer'"
                >Subtotal:</td>
                <td class="report-subtotal" v-if="row.type==='footer'">{{row.total}}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="report-total">
                <td class="reports-first-column reports-head-cell-top"></td>
                <td class="reports-head-cell reports-head-cell-top"></td>
                <td class="reports-head-cell reports-head-cell-top"></td>
                <td class="reports-head-cell reports-head-cell-top">Total:</td>
                <td class="reports-head-cell reports-head-cell-top">{{report.total}}</td>
              </tr>
            </tfoot>
          </table>
          <div style="opacity:0">
            <Table id="report-data">
			        <Column ss:Width="55"/>
              <Column ss:Width="95"/>
              <Column ss:Width="180"/>
              <Column ss:Width="75"/>
              <Column ss:Width="45"/>
              <Row>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Position</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Employee</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Time</Data>
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Title">
                  <Data ss:Type="String">Rate</Data>
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Title">
                  <Data ss:Type="String">Amount</Data>
                </Cell>
              </Row>
              <Row v-for="(user, i) in report.users_rows">
                <Cell ss:StyleID="Normal">
                  <Data ss:Type="String">{{user.position}}</Data>
                </Cell>
                <Cell ss:StyleID="Normal">
                  <Data ss:Type="String">{{user.name}}</Data>
                </Cell>
                <Cell ss:StyleID="NormalNumber"
                     :ss:Formula="getUserFormula(user, report.users_rows, report.rows)">
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Normal">
                  <Data ss:Type="String">{{user.rate}}</Data>
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Normal"
                     ss:Formula="=RC[-2]*RC[-1]">
                </Cell>
              </Row>
              <Row>
                <Cell ss:StyleID="Title" ss:MergeAcross="1">
                  <Data ss:Type="String">Total:</Data>
                </Cell>
                <Cell ss:StyleID="TitleNumber"
                     :ss:Formula="getUserTotalFormula(report.users)">
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Title">
                  <Data ss:Type="String"></Data>
                </Cell>
                <Cell v-if="use_rates" ss:StyleID="Title"
                     :ss:Formula="getRateTotal(report.users_rows)">
                </Cell>
              </Row>
              <Row>
                <Cell>
                </Cell>
              </Row>

              <Row>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Date</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Employee</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Task</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Comment</Data>
                </Cell>
                <Cell ss:StyleID="Title">
                  <Data ss:Type="String">Time</Data>
                </Cell>
              </Row>1
              <Row :ss:Height="row.type==='header' ? '30' : undefined" v-for="(row, i) in report.rows">
                <Cell ss:StyleID="Title" v-if="row.type==='header'">
                  <Data ss:Type="String">Deal:</Data>
                </Cell>
                <Cell ss:StyleID="Title" ss:MergeAcross="3" v-if="row.type==='header'">
                  <Data ss:Type="String">{{row.title}}</Data>
                </Cell>

                <Cell ss:StyleID="Normal" v-if="row.type==='item'">
                  <Data ss:Type="String">{{row.date}}</Data>
                </Cell>
                <Cell ss:StyleID="Normal" v-if="row.type==='item'">
                  <Data ss:Type="String">{{row.user}}</Data>
                </Cell>
                <Cell ss:StyleID="Normal" v-if="row.type==='item'">
                  <Data ss:Type="String">{{row.task}}</Data>
                </Cell>
                <Cell ss:StyleID="Normal" v-if="row.type==='item'">
                  <Data ss:Type="String" v-if="row.invoiced_tc && show_invoiced_comment">Invoiced TC. {{row.comment}}</Data>
                  <Data ss:Type="String" v-if="!row.invoiced_tc || !show_invoiced_comment">{{row.comment}}</Data>
                </Cell>
                <Cell ss:StyleID="NormalNumber" v-if="row.type==='item'">
                  <Data ss:Type="Number">{{row.time}}</Data>
                </Cell>

                <Cell ss:StyleID="Title" ss:MergeAcross="3" v-if="row.type==='footer'">
                  <Data ss:Type="String">Subtotal:</Data>
                </Cell>
                <Cell ss:StyleID="TitleNumber" v-if="row.type==='footer'"
                     :ss:Formula="getDealTotalFormula(row)">
                </Cell>
              </Row>
              <Row>
                <Cell ss:StyleID="Title" ss:MergeAcross="3">
                  <Data ss:Type="String">Total:</Data>
                </Cell>
                <Cell ss:StyleID="TitleNumber"
                     :ss:Formula="getTotalFormula(report.rows)">
                </Cell>
              </Row>
            </Table>
          </div>
        </div>
      </div>
    </div>
    <vue-alert></vue-alert>
  </div>
</template>

<script>
import Vue from "vue";

var _ = require("lodash");
var moment = require("moment");
var Decimal = require('decimal.js');
var Hours = Decimal.clone({ rounding: 0 })

var INVOICED_TC = "UF_AUTO_174381829308";
var SITE = "https://legaltax.bitrix24.com";

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

import ItemTemplate from './ItemTemplate.vue';

import * as bitrix from './bitrix24.js';
import tableToExcel from './excelExport.js';

export default {
  name: "app",
  components: {
      Loading
  },
  data() {
    return {
      filter_invoiced_tc: -1,
      filter_deal_items: [],
      filter_deal_item: null,
      filter_disable_client: false,
      filter_client_items: [],
      filter_client_item: null,
      filter_disable_company: false,
      filter_company_items: [],
      filter_company_item: null,
      filter_task_items: [],
      filter_task_item: null,
      filter_user_items: [],
      filter_user_item: null,
      filter_items_template: ItemTemplate,

      show_invoiced_comment: false,

      report_is_loading: false,

      current_user: null,

      rates: [
        {
          'trainee': 25,
          'assistant': 25,
          'business support manager': 25,
          'legal assistant': 60,
          'associate': 100,
          'senior associate': 120,
          'partner': 150,
          'associate partner': 150,
          'senior counsel': 150,
          'senior counsel, attorney-at-law': 150
        },
        {
          'trainee': 25,
          'assistant': 25,
          'business support manager': 25,
          'legal assistant': 50,
          'associate': 85,
          'senior associate': 100,
          'partner': 120,
          'associate partner': 120,
          'senior counsel': 120,
          'senior counsel, attorney-at-law': 120
        },
        {
          'trainee': 20,
          'assistant': 20,
          'business support manager': 20,
          'legal assistant': 40,
          'associate': 70,
          'senior associate': 85,
          'partner': 100,
          'associate partner': 100,
          'senior counsel': 100,
          'senior counsel, attorney-at-law': 100
        },
        {
          'trainee': 10,
          'assistant': 10,
          'business support manager': 10,
          'legal assistant': 15,
          'associate': 20,
          'senior associate': 25,
          'partner': 40,
          'associate partner': 40,
          'senior counsel': 40,
          'senior counsel, attorney-at-law': 40
        }
      ],
      /*
        Рейты (1/2)
        Trainee=Assistant=25|20
        Legal Assistant 50|40
        Associate 85|70
        Senior Associate: 100|85
        Partner=Associate Partner=Senior Counsel: 120|100
      */
      current_rate: 1,
      use_rates: true,
      use_join: true,

      selected_client: -1,
      selected_company: -1,
      selected_deal: -1,
      selected_task: -1,
      completed_from: "",
      completed_to: "",
      selected_user: -1,
      clients: [],
      companies: [],
      deals: [],
      tasks: [],
      users: [],
      report: {
        users: {},
        users_rows: [],
        deals: {},
        rows: [],
        total: 0,
        cache_tasks: {},
        cache_deals: {},
        cache_rel_task_deal: {},
        cache_users: {}
      },
      report_exist: false,

      active_job: "",
      active_job_done: "0"
    };
  },
  created: function() {
    let self = this;
    bitrix.fitWindow(0, 600);
    bitrix.Profile().then(user => {
      self.current_user = user;
    });
    self.setFilterToLastMonth();
  },
  watch: {
    filter_invoiced_tc: function() {
      this.selected_task = -1;
      this.filter_task_item = null;
    },
    current_rate: function() {
      this.updateUsersRates();
    }
  },
  methods: {
    setActiveJob: function(job) {
      this.active_job = job;
      this.active_job_done = "";
    },
    markAsInvoicedTC: function() {
      let self = this;

      Vue.swal.fire({
        position: 'top',
        title: 'Are you sure?',
        text: "Mark all tasks as Invoiced TC",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, do it!'
      }).then((result) => {
        if (result.value) {
          let data = {};
          data[INVOICED_TC] = 1;

          let tasks = _.flatMap(self.$data.report.deals, deal => deal.items);
          let ids = _.map(tasks, task => task.id);

          bitrix.BatchUpdateTask(ids, data).then(function(res){
            _.each(self.$data.report.rows, row => {
              if (row.invoiced_tc != undefined)
                row.invoiced_tc = true;
            });

            Vue.swal.fire({
              position: 'top',
              title: 'Done!',
              text: 'All tasks as Invoiced TC.',
              type: 'success'
            });
          }).catch(error => self.showError(error));
        }
      })

    },
    showHideInvoicedTCComment: function() {
      let self = this;
      self.show_invoiced_comment = !self.show_invoiced_comment;
    },
    setFilterToLast3Month: function() {
      let self = this;
      let start = moment().subtract(3, "months").startOf('month');
      let end = moment().subtract(1, "months").endOf('month');
      self.completed_from = start.format("YYYY-MM-DD");
      self.completed_to = end.format("YYYY-MM-DD");
    },
    setFilterToLastMonth: function() {
      let self = this;
      let start = moment().subtract(1, "months").startOf('month');
      let end = moment().subtract(1, "months").endOf('month');
      self.completed_from = start.format("YYYY-MM-DD");
      self.completed_to = end.format("YYYY-MM-DD");
    },
    setFilterToThisMonth: function() {
      let self = this;
      let start = moment().startOf('month');
      let end = moment().endOf('month');
      self.completed_from = start.format("YYYY-MM-DD");
      self.completed_to = end.format("YYYY-MM-DD");
    },
    updateDealItems(query) {
      let self = this;
      let filter = {};
      if (query.trim().length !== 0) {
        filter['%TITLE'] = query;
      }
      if (self.selected_client != -1)
      {
        filter['CONTACT_ID'] = self.selected_client;
      }
      if (self.selected_company != -1)
      {
        filter['COMPANY_ID'] = self.selected_company;
      }

      self.setActiveJob("Loading Deals");
      return bitrix.GetDeals(
        { STAGE_ID: "ASC" },
        filter,
        ["ID", "TITLE", "DATE_CREATE", "CLOSEDATE"]
        ).then(deals => {
        self.filter_deal_items = deals;
      });
    },
    selectDealItem(item) {
      if (item && item.ID === this.$data.selected_deal) return;
      this.$data.selected_task = -1;
      this.$data.filter_task_item = null;
      if (item)
        this.$data.selected_deal = item.ID;
      else
        this.$data.selected_deal = -1;
    },
    updateTaskItems(query) {
      let self = this;
      let filter = { };
      if (query.trim().length !== 0) {
        filter['%TITLE'] = query;
      }
      if ((self.selected_client != -1 || self.selected_company != -1)
          && self.selected_deal == -1) {
        self.filter_task_items = [{
          ID: -1,
          TITLE: 'Need to select deal first'
        }];
      } else {
        if (self.selected_deal != -1) {
          let dealCreateDate = self.filter_deal_item.DATE_CREATE;
          if (moment(dealCreateDate).isValid()) {
            dealCreateDate = moment(dealCreateDate).subtract(14, "days");
            filter['>=CREATED_DATE'] = dealCreateDate.format();
            console.log("dealCreateDate", dealCreateDate);
          }

          let dealCloseDate = self.filter_deal_item.CLOSEDATE;
          if (moment(dealCloseDate).isValid()) {
            dealCloseDate = moment(dealCloseDate).add(14, "days");
            filter['<=CREATED_DATE'] = dealCloseDate.format();
            console.log("dealCloseDate", dealCloseDate);
          }
        }

        self.setActiveJob("Loading Tasks");
        bitrix.GetTasks(
          { ID: "desc" },
          filter,
          ["ID", "TITLE", "UF_*"],
        ).then(tasks => {
          if (self.selected_deal != -1) {
            self.filter_task_items = _.filter(tasks, task => {
              if (self.filter_invoiced_tc != -1 && task[INVOICED_TC] != self.filter_invoiced_tc) return false;
              let dealId = bitrix.GetTaskDealId(task);
              console.log("dealId", dealId);
              return self.selected_deal == dealId;
            });
          } else {
            self.filter_task_items = tasks;
          }
        });
      }
    },
    selectTaskItem(item) {
      if (item && item.ID === this.$data.selected_task) return;
      if (item)
        this.$data.selected_task = item.ID;
      else
        this.$data.selected_task = -1;
    },
    updateCompanyItems(query) {
      let self = this;
      let filter = {};
      if (query.trim().length !== 0) {
        filter = { '%TITLE': query };
      }

      self.setActiveJob("Loading Companies");
      return bitrix.GetCompanies(
        { STAGE_ID: "ASC" },
        filter,
        ["ID", "TITLE"]
        ).then(companies => {
        self.filter_company_items = companies;
      });
    },
    selectCompanyItem(item) {
      if (item && item.ID === this.$data.selected_company) return;
      this.$data.selected_client = -1;
      this.$data.filter_client_item = null;
      this.$data.selected_deal = -1;
      this.$data.filter_deal_item = null;
      this.$data.selected_task = -1;
      this.$data.filter_task_item = null;
      if (item) {
        this.$data.filter_disable_client = true;
        this.$data.selected_company = item.ID;
      } else {
        this.$data.filter_disable_client = false;
        this.$data.selected_company = -1;
      }
    },
    updateClientItems(query) {
      let self = this;

      let filter1 = { TYPE_ID: "CLIENT" };
      let filter2 = { TYPE_ID: "CLIENT" };
      let filter3 = { TYPE_ID: "CLIENT" };
      if (query.trim().length !== 0) {
        filter1['%LAST_NAME'] = query;
        filter2['%NAME'] = query;
        filter3['%SECOND_NAME'] = query;
      }

      let params = [{
        order: { ID: "ASC" },
        filter: filter1,
        params: {},
        select: ["ID","LAST_NAME","NAME","SECOND_NAME"]
      }, {
        order: { ID: "ASC" },
        filter: filter2,
        params: {},
        select: ["ID","LAST_NAME","NAME","SECOND_NAME"]
      }, {
        order: { ID: "ASC" },
        filter: filter3,
        params: {},
        select: ["ID","LAST_NAME","NAME","SECOND_NAME"]
      }];

      self.setActiveJob("Loading Clients");
      return bitrix.BatchClients(params).then(clients => {
        self.$data.filter_client_items = clients;
      });
    },
    selectClientItem(item) {
      if (item && item.ID === this.$data.selected_client) return;
      this.$data.selected_company = -1;
      this.$data.filter_company_item = null;
      this.$data.selected_deal = -1;
      this.$data.filter_deal_item = null;
      this.$data.selected_task = -1;
      this.$data.filter_task_item = null;
      if (item) {
        this.$data.filter_disable_company = true;
        this.$data.selected_client = item.ID;
      } else {
        this.$data.filter_disable_company = false;
        this.$data.selected_client = -1;
      }
    },
    updateUserItems(query) {
      let self = this;

      let filter = {};

      if (query.trim().length !== 0) {
        filter['NAME_SEARCH'] = query;
      }

      self.setActiveJob("Loading Users");
      return bitrix.GetUsers(
        { ID: "ASC" },
        filter,
        ["ID","LAST_NAME","NAME","SECOND_NAME"]
      ).then(users => {
        self.filter_user_items = users;
      });
    },
    selectUserItem(user) {
      if (user && user.ID === this.$data.selected_user) return;
      if (user)
        this.$data.selected_user = user.ID;
      else
        this.$data.selected_user = -1;
    },
    getTitle(item) {
      if (item)
        return item.TITLE;
      else
        return'';
    },
    getFIO(item) {
      if (item)
        return [
          item.LAST_NAME || '',
          item.NAME || '',
          item.SECOND_NAME || ''
        ].join(" ");
      else
        return'';
    },
    getRate: function(name) {
      let data = this.$data;
      return _.get(data.rates, [data.current_rate, _.toLower(_.trim(name))], 0);
    },
    reportGetDealsForCompany: function(company) {
      let self = this;
      console.log("reportGetDealsForCompany", company);

      self.setActiveJob("Loading Deals");
      bitrix.GetDeals({ STAGE_ID: "ASC" }, { COMPANY_ID: company.ID }, ["*"], null, true)
        .then(deals => {
          console.log("reportGetDealsForCompany deals", deals);
          _.each(deals, deal => self.storeDealInCache(deal));
          self.reportGetTasksForDeals(deals);
        })
        .catch(error => self.showError(error));
    },
    reportGetDealsForClient: function(client) {
      let self = this;
      console.log("reportGetDealsForClient", client);

      self.setActiveJob("Loading Deals");
      bitrix.GetDeals({ STAGE_ID: "ASC" }, { CONTACT_ID: client.ID }, ["*"], null, true)
        .then(deals => {
          console.log("reportGetDealsForClient deals", deals);
          _.each(deals, deal => self.storeDealInCache(deal));
          self.reportGetTasksForDeals(deals);
        })
        .catch(error => self.showError(error));
    },
    reportGetTasksForDeals: function(deals) {
      console.log("reportGetTasksForDeals", deals);
      let self = this;

      if (_.size(deals) == 0) {
        self.showError("No entries found");
        return;
      }

      let filter = {};

      //* As we can't filter tasks by deal id, we:
      //* try to optimaze tasks request by filter them by date
      //* task should be created after deal created and before deal closed.
      //* For sure we make 2 days shift (fuuuuuuuuck... change to 3 months).
      let dealsCreateDate = _.map(deals, deal => deal.DATE_CREATE);
      dealsCreateDate = _.filter(dealsCreateDate, date => moment(date).isValid());
      console.log("dealsCreateDate", dealsCreateDate);
      dealsCreateDate = _.map(dealsCreateDate, date => moment(date));
      let createDate = _.min(dealsCreateDate);
      if (createDate) {
        createDate = createDate.subtract(3, "months");
        filter['>=CREATED_DATE'] = createDate.format();
      }
      console.log("createDate", createDate);

      let dealsIds = _.map(deals, deal => deal.ID);
      console.log("deals IDs", dealsIds);

      self.setActiveJob("Loading Tasks");
      bitrix.GetTasks({ ID: "desc" }, filter, ["ID", "TITLE", "UF_*"], null, true)
        .then(function(tasks) {
          console.log("find tasks", tasks);
          let filteredTasks = _.filter(tasks, task => {
            task.invoiced_tc = task[INVOICED_TC] == "1";
            if (self.$data.filter_invoiced_tc != -1 && task[INVOICED_TC] != self.$data.filter_invoiced_tc) return false;
            let dealId = bitrix.GetTaskDealId(task);
            self.storeRelTaskDealInCache(task, dealId);
            self.storeTaskInCache(task);
            return _.indexOf(dealsIds, dealId) != -1;
          });
          console.log("find deals tasks", filteredTasks);
          self.reportGetElapsedItemsForTasks(filteredTasks);
        })
        .catch(error => self.showError(error));
    },
    reportGetElapsedItemsForTasks: function(tasks) {
      console.log("reportGetElapsedItemsForTasks", tasks);
      let self = this;

      if (_.size(tasks) == 0) {
        self.showError("No entries found");
        return;
      }

      let filter = {};

      // Add additional filters
      if (self.$data.selected_user != -1) {
        filter["USER_ID"] = self.$data.selected_user;
      }
      if (self.$data.completed_to) {
        filter["<=CREATED_DATE"] = moment(self.$data.completed_to).add(1, "days").format();
      }
      if (self.$data.completed_from) {
        filter[">=CREATED_DATE"] = self.$data.completed_from;
      }

      let batchCmd = _.map(tasks, task => {
        return {
          TASKID: task.ID,
          ORDER: {
            CREATED_DATE: "asc"
          },
          FILTER: filter
        }
      });

      self.setActiveJob("Loading Elapsed Items");
      bitrix.BatchElapsedItem(batchCmd).then(items => {
        console.log("batch task.elapseditem.getlist", items);
        if (self.$data.selected_user != -1) {
          items = _.filter(items, item => {
            return item.USER_ID == self.$data.selected_user
          });
        }
        self.reportOutput(items);
      }).catch(error => self.showError(error));
    },
    reportOutput: function(items) {
      // Build final report view
      console.log("reportOutput", items);
      let self = this;

      _.each(items, item => {
        console.log("reportOutput elapsedItem", item);

        let itemTime = new Hours(convertToHours(item.MINUTES));

        // Add user time to report
        if (!self.$data.report.users[item.USER_ID]) {
          self.$data.report.users[item.USER_ID] = {
            USER_ID: item.USER_ID,
            total: 0
          };
        }
        let user = self.$data.report.users[item.USER_ID];
        // Calculate user total
        // user.total += itemTime;
        user.total = itemTime.add(user.total).toFixed(1);

        // Calculate general total
        // self.$data.report.total += itemTime;
        self.$data.report.total = itemTime.add(self.$data.report.total).toFixed(1);

        // Add deal time to report
        console.log(item);
        let task = self.getTaskFromCache(item.TASK_ID);
        let deal = self.getDealByTaskFromCache(task);

        if (!self.$data.report.deals[deal.ID]) {
          self.$data.report.deals[deal.ID] = {
            id: deal.ID,
            title: deal.TITLE,
            total: 0,
            items: []
          };
        }
        let dealRow = self.$data.report.deals[deal.ID];
        // Calculate deal total
        // dealRow.total += itemTime;
        dealRow.total = itemTime.add(dealRow.total).toFixed(1);
        // Add
        dealRow.items.push({
          id: item.TASK_ID,
          date: item.CREATED_DATE,
          USER_ID: item.USER_ID,
          task: task.TITLE,
          comment: item.COMMENT_TEXT,
          time: itemTime,
          invoiced_tc: task[INVOICED_TC] == "1"
        });
      });

      let batchCmd = _.map(self.$data.report.users, user => {
        return {
          ID: user.USER_ID
        }
      });

      self.setActiveJob("Loading Users");
      bitrix.BatchUser(batchCmd).then(users => {
        console.log("batch user.get", users);
        _.each(users, user => {
          user["FULL_NAME"] = bitrix.GetUserFullName(user);
          self.storeUserInCache(user);
        });
        self.makeRowReport();
      }).catch(error => self.showError(error));
    },
    makeRowReport: function() {
      let self = this;
      let report = self.$data.report;
      // Create row based report view
      report.total = report.total;
      _.each(report.deals, deal => {
        let rowCount = 0;
        report.rows.push({
          type: "header",
          title: deal.title,
          deal_id: deal.id
        });
        _.each(_.sortBy(deal.items, ['date']), item => {

          if (self.use_join) {
            if (!(report.rows.find( function(row) {
              if ((row.user_id === item.USER_ID)&&
                 (row.task === item.task)&&
                 (row.date === formatDate(item.date))&&
                 (row.comment === item.comment)) {
                  let a = formatDate(item.date);
                  console.log(row.task + " !!!!!!!!! " + row.date.toString() + " " + a.toString());
                row.time = (Number(row.time) + Number(item.time)).toFixed(1);
                return true;
              } else {
                return false;
              }
            }))) {
              report.rows.push({
                    type: "item",
                    date: formatDate(item.date),
                    user: self.getUserFromCache(item.USER_ID).FULL_NAME,
                    task: item.task,
                    comment: item.comment,
                    time: item.time,
                    invoiced_tc: item.invoiced_tc,
                    task_id: item.id,
                    user_id: item.USER_ID
              });
              rowCount++;
            }
          } else {
            report.rows.push({
                    type: "item",
                    date: formatDate(item.date),
                    user: self.getUserFromCache(item.USER_ID).FULL_NAME,
                    task: item.task,
                   comment: item.comment,
                    time: item.time,
                   invoiced_tc: item.invoiced_tc,
                   task_id: item.id,
                    user_id: item.USER_ID
            });
            rowCount++;
          }
        });

        report.rows.push({
          type: "footer",
          total: deal.total,
          count: rowCount
        });
      });
      report.users_rows = _.map(report.users, (value, key) => {
        let user = self.getUserFromCache(key);
        report.users[key]["name"] = user.FULL_NAME;
        report.users[key]["position"] = user.WORK_POSITION;
        report.users[key].total = report.users[key].total;
        report.users[key].rate = 0;
        report.users[key].amount = 0;
        return report.users[key];
      });
      self.updateUsersRates();
      self.stopLoading();
      self.$data.report_exist = true;
      bitrix.fitWindow(0, 200);
    },
    updateUsersRates: function() {
      let self = this;
      let report = self.$data.report;
      report.total_amount = Decimal(0);
      _.each(report.users_rows, function(user){
        user.rate = self.getRate(user.position);
        user.amount = Decimal(user.total).mul(Decimal(user.rate));
        report.total_amount = report.total_amount.add(user.amount);
      });
    },
    cleanReport: function(cleanSelected = true) {
      console.log("cleanReport");
      let data = this.$data;
      let report = data.report;

      if (cleanSelected) {
        data.filter_deal_item = null;
        data.filter_client_item = null;
        data.filter_company_item = null;
        data.filter_task_item = null;
        data.selected_client = -1;
        data.selected_company = -1;
        data.selected_deal = -1;
        data.selected_task = -1;
        data.completed_from = "";
        data.completed_to = "";
        data.selected_user = -1;
      }

      // Empty last report data
      report.users = {};
      report.users_rows = [];
      report.deals = {};
      report.rows = [];
      report.total = 0;
      report.cache_tasks = {};
      report.cache_deals = {};
      report.cache_rel_task_deal = {};
      report.cache_users = {};
      this.$data.report_exist = false;

      this.setActiveJob("");
    },
    exportReport: function() {
      tableToExcel(["report-data"], "report", "report.xls");
    },
    getDealUrl: function(id) {
      return `${SITE}/crm/deal/details/${id}/`;
    },
    getTaskUrl: function(id) {
      let self = this;
      return `${SITE}/company/personal/user/${self.current_user.ID}/tasks/task/view/${id}/`;
    },
    getRateTotal: function(users) {
      //
      return `=SUM(R[-${_.size(users)}]C:R[-1]C)`;
    },
    getUserFormula: function(user, users, rows) {
      let data = this.$data;
      let report = data.report;
      //! Magic depends on rendered view
      // =SUMIF(R9C2:R13C5,&quot;=&quot;&amp;RC[-1],R9C5:R13C5)
      let tasks_from = _.size(users) + 5;
      let tasks_to = _.size(users) + 5 + report.rows.length;
      return `=SUMIF(R${tasks_from}C2:R${tasks_to}C5,"="&RC[-1],R${tasks_from}C5:R${tasks_to}C5)`;
    },
    getUserTotalFormula: function(users) {
      //! Magic depends on rendered view
      //=SUM(R[-3]C:R[-1]C)
      return `=SUM(R[-${_.size(users)}]C:R[-1]C)`;
    },
    getDealTotalFormula: function(row) {
      //! Magic depends on rendered view
      //=SUM(R[-5]C:R[-1]C)
      return `=SUM(R[-${row.count}]C:R[-1]C)`;
    },
    getTotalFormula: function(rows) {
      //! Blood Magic depends on rendered view
      let index = _.size(rows);
      if (index == 0) return "";
      index = index - 1;
      let elements = [];
      let rows_total = _.filter(rows, row => row.count);
      _.each(rows_total, row => {
        elements.push("R[-"+(index - row.count)+"]C");
        index = index - row.count - 2;
      });
      return "=" + elements.join("+");
    },
    generateReport: function() {
      console.log("generateReport");
      let self = this;

      // Empty last report data
      self.cleanReport(false);

      self.startLoading();

      if (self.$data.selected_task != -1) {
        // if task selected: get time logs only by this task
        console.log("process task", self.$data.selected_task);

        self.setActiveJob("Loading Tasks");
        bitrix.GetTask(self.$data.selected_task)
          .then(task => {
            self.storeTaskInCache(task);
            // get task related deal data for report
            let dealId = bitrix.GetTaskDealId(task);
            if (dealId) {
              bitrix.GetDeal(dealId)
                .then(deal => {
                  self.storeDealInCache(deal);
                  self.storeRelTaskDealInCache(task, dealId);
                  // process time log items
                  self.reportGetElapsedItemsForTasks([task]);
                })
                .catch(error => {
                  self.showError(error);
                });
            } else {
              self.reportGetElapsedItemsForTasks([task]);
            }
          })
          .catch(error => self.showError(error));
      } else if (self.$data.selected_deal != -1) {
        // if deal selected:
        console.log("process deal", self.$data.selected_deal);
        bitrix.GetDeal(self.$data.selected_deal)
          .then(deal => {
            self.storeDealInCache(deal);
            self.reportGetTasksForDeals([deal]);
          })
          .catch(error => {
            self.showError(error);
          });
      } else if (self.$data.selected_client != -1) {
        // if client selected
        console.log("process client", self.$data.selected_client);
        bitrix.GetClient(self.$data.selected_client)
          .then(client => {
            self.reportGetDealsForClient(client);
          })
          .catch(error => {
            self.showError(error);
          });
      } else if (self.$data.selected_company != -1) {
        // if company selected
        console.log("process company", self.$data.selected_company);
        bitrix.GetCompany(self.$data.selected_company)
          .then(company => {
            self.reportGetDealsForCompany(company);
          })
          .catch(error => {
            self.showError(error);
          });
      } else {
        self.stopLoading();
      }
    },
    startLoading: function() {
      this.$data.report_is_loading = true;
    },
    stopLoading: function() {
      this.$data.report_is_loading = false;
    },
    showError: function(error) {
      this.stopLoading();
      Vue.swal.fire({
        position: 'top',
        type: 'error',
        title: 'Oops...',
        text: error
      })
    },
    storeTaskInCache: function(task) {
      console.log("storeTaskInCache", task);
      let report = this.$data.report;
      report.cache_tasks[task.ID.toString()] = task;
    },
    storeDealInCache: function(deal) {
      console.log("storeDealInCache", deal);
      let report = this.$data.report;
      report.cache_deals[deal.ID.toString()] = deal;
    },
    storeUserInCache: function(user) {
      console.log("storeUserInCache", user);
      let report = this.$data.report;
      report.cache_users[user.ID.toString()] = user;
    },
    storeRelTaskDealInCache: function(task, dealId) {
      console.log("storeRelTaskDealInCache", task, dealId);
      let report = this.$data.report;
      report.cache_rel_task_deal[task.ID.toString()] = dealId;
    },
    getDealByTaskFromCache: function(task) {
      console.log("getDealByTaskFromCache", task);
      let report = this.$data.report;
      let dealId = report.cache_rel_task_deal[task.ID.toString()];
      if (!dealId) return {
        ID: -1,
        TITLE: ""
      };
      return report.cache_deals[dealId.toString()];
    },
    getTaskFromCache: function(taskId) {
      console.log("getTaskFromCache", taskId);
      let report = this.$data.report;
      return report.cache_tasks[taskId.toString()];
    },
    getUserFromCache: function(userId) {
      console.log("getUserFromCache", userId);
      let report = this.$data.report;
      return report.cache_users[userId.toString()];
    }
  }
};

function roundUp(num, precision) {
  precision = Math.pow(10, precision);
  return Math.ceil(num * precision) / precision;
}

function convertToHours(minutes) {
  let mins = new Hours(minutes);
  let hours = mins.div(60);
  return hours.toFixed(1);
}
function formatDate(date) {
  return moment(date).format("DD.MM.YYYY");
}

</script>

<style>
body {
  background: none;
}

.filter-field-buttons input[type="button"] {
  height: 25px;
  padding: 0 18px;
  border-width: 1px;
  border-style: solid;
  border-color: #f1f1f1 #d8d8d8 #a9a9a9;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px;
  -khtml-border-radius: 3px;
  border-radius: 3px;
  -webkit-box-shadow: 0 0 1px #ccc;
  -moz-box-shadow: 0 0 1px #ccc;
  box-shadow: 0 0 1px #ccc;
  font: bold 13px/25px "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #555;
  text-shadow: #fff 0 1px 1px !important;
  cursor: pointer;
  outline: 0;
  overflow: visible;
  background: url(/bitrix/templates/bitrix24/images/interface/buttons-sprite.png)
    repeat-x left -217px;
}

.filter-field-buttons input[type="button"]:active {
  border-color: #8c939e #9fa7b0 #c8d1d5;
  background-position: left -283px;
}

.filter-field-buttons input[type="button"]:hover {
  background-position: left -250px;
}

input:disabled,
select:disabled,
button:disabled {
  opacity: 0.5;
}

#workarea-content {
  overflow: auto;
  margin-right: 280px;
}

#sidebar {
  position: fixed;
  right: 0;
  z-index: 1;
}

.report-total {
  font-weight: bold;
}

.report-subtotal {
  font-weight: bold;
  font-style: italic;
}

.report-deal {
  font-style: italic;
  text-decoration: underline;
}

.v-autocomplete .v-autocomplete-input-group .v-autocomplete-input {
	padding: 1px 5px;
	box-shadow: none;
	border: 1px solid #157977;
	width: 225px;
	outline: none;
	background-color: #eee;
}

.v-autocomplete .v-autocomplete-input-group.v-autocomplete-selected .v-autocomplete-input {
	color: #008000;
	background-color: #f2fff2;
}

.v-autocomplete .v-autocomplete-list {
	width: 225px;
	text-align: left;
	border: none;
	border-top: none;
	max-height: 200px;
	overflow-y: auto;
	border-bottom: 1px solid #157977;
  z-index: 2;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item {
	cursor: pointer;
	background-color: #fff;
	padding: 10px;
	border-bottom: 1px solid #157977;
	border-left: 1px solid #157977;
	border-right: 1px solid #157977;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:last-child {
	border-bottom: none;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item:hover {
	background-color: #eee;
}

.v-autocomplete .v-autocomplete-list .v-autocomplete-list-item abbr {
	opacity: 0.8;
	font-size: 0.8em;
	display: block;
	font-family: sans-serif;
}

.vue-alert {
  margin-top: 10px;
}

.months input {
  width: 225px;
}

input.btn-apply {
  width: 110px;
}

input.btn-clean {
  width: 111px;
}

input.btn-export {
  width: 225px;
  margin-top: 5px;
}

.filter-field-buttons input.btn-invoiced-comment {
  width: 225px;
  margin-bottom: 15px;
}

.sidebar-block-inner form {
  margin-bottom: 20px;
}

.progress-info {
  position: absolute;
  top: 45%;
  left: 40%;
}

[data-popover='join-popover'] {
  color: #555;
  line-height: 1.5;
  margin: -10px;
  padding: 0 20px;
}
</style>
