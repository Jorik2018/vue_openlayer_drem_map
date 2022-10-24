<template>
  <v-map ref="map" style="height: 100%" @build="mapBuild" @addlayer="addlayer">
    <v-layer-control ref="layerControl" @scope="scope"></v-layer-control>
    <v-overlay
      ref="search"
      class="search"
      @opened="openedSearch"
      header="Busqueda de concesiones"
      v-model="o"
    >
      <template>
        <div v-show="!sizeC">
          <ul class="v-tabs" style="text-align: center; margin: 5px">
            <li
              @click="o.concesionTab = 1"
              :class="{ 'v-selected': o.concesionTab == 1 }"
            >
              Código Único
            </li>
            <li
              @click="o.concesionTab = 2"
              :class="{ 'v-selected': o.concesionTab == 2 }"
            >
              Por Nombre
            </li>
            <li
              @click="o.concesionTab = 3"
              :class="{ 'v-selected': o.concesionTab == 3 }"
            >
              Por Lista General
            </li>
          </ul>
          <div class="v-form" style="margin: 5px">
            <input
              v-if="o.concesionTab == 1"
              v-model="filters.code"
              placeholder="Ingrese Código Único"
            />
            <input
              v-if="o.concesionTab == 2"
              v-model="filters.concon"
              placeholder="Ingrese Nombre o Concesionario"
            />
            <template v-if="o.concesionTab == 3">
              <label>Provincia:</label>
              <v-select
                v-model="filters.province"
                @input="
                  $refs.districtSelectC
                    ? $refs.districtSelectC.load({
                        idDpto: '02',
                        idProv: filters.idProv1,
                      })
                    : 0
                "
              >
                <option>Seleccionar Opción</option>
                <v-options
                  url="/admin/directory/api/province/0/0?regionId=02"
                  value-field="pk.idProv"
                  display-field="name"
                />
              </v-select>
              <template v-show="filters.province">
                <label>Distrito:</label>
                <v-select
                  ref="districtSelectC"
                  v-model="filtersC.district"
                  :disabled="!filtersC.province"
                >
                  <option value="">Seleccionar Opción</option>
                  <v-options
                    url="/admin/directory/api/district/0/0"
                    display-field="name"
                  />
                </v-select>
              </template>
            </template>
            <div class="center">
              <v-button
                style="margin-top: auto auto; margin-top: 5px; width: auto"
                value="BUSCAR"
                @click="refresh2($refs.concesions)"
              />
              <div
                v-if="sizeC === 0"
                class="yellow alert"
                style="margin-top: 10px"
              >
                No existe registros con el valor ingresado!
              </div>
            </div>
          </div>
        </div>
        <v-table
          ref="concesions"
          v-show="sizeC"
          style="width: 100%"
          scrollable="true"
          src="/admin/drem/api/petitorio"
          @loaded="
            ss($event.target);
            sizeC = $event.target.size;
          "
          :selectable="false"
          :autoload="false"
          :filters="filtersC"
          :pagination="20"
        >
          <template v-slot="{ row }">
            <td width="170" header="DISTRITO">
              <v-filter>
                <input v-model="filtersC.district" />
              </v-filter>
              {{ row.district }}{{ filtersC }}
            </td>
            <td width="120" header="CODIGO UNICO" class="center">
              <v-filter>
                <input v-model="filtersC.code" />
              </v-filter>
              <a @click="openi(row)">{{ row.code }}</a>
            </td>
            <td width="120" header="FEC_DENU" class="center">
              <v-filter>
                <input v-model="filtersC.fec_denu" />
              </v-filter>
              {{ row.fecDenu | date }}
            </td>
            <td width="200" header="NOMBRE">
              <v-filter index="3">
                <input v-model="filtersC.concesion" />
              </v-filter>
              {{ row.concesion }}
            </td>
            <td width="250" header="TIT_CONCES">
              <v-filter index="4">
                <input v-model="filtersC.concessionaire" />
              </v-filter>
              {{ row.concessionaire }}
            </td>
            <td width="300" header="D_ESTADO">
              <v-filter>
                <input v-model="filtersC.d_estado" />
              </v-filter>
              {{ row.destado }}
            </td>
            <td width="200" header="UBICACION EXP">
              <v-filter>
                <input v-model="filtersC.ubica_exp" />
              </v-filter>
              {{ row.ubicaExp }}
            </td>
          </template>
        </v-table>
      </template>
      <template v-if="sizeC" v-slot:footer>
        <div class="right">
          <v-button
            icon="fa-arrow-left"
            value="Regresar"
            class="on"
            @click.prevent="sizeC = null"
          />
          <div style="display: inline-block; float: left; padding: 4px">
            Registros encontrados ({{ sizeC }})
          </div>
          <v-button
            icon="fa-sync"
            class="on"
            @click.prevent="$refs.concesions.load()"
          ></v-button>
        </div>
      </template>
    </v-overlay>
    <v-overlay ref="printer" header="Descargar Mapa" :value="{}">
      <template>
        <v-fieldset legend="Formato Archivo">
          <v-radio-group v-model="format">
            <v-radio value="PDF" />
            <v-radio value="PNG" />
          </v-radio-group>
        </v-fieldset>
      </template>
      <template v-slot:footer>
        <center>
          <v-button icon="fa-download" value="Descargar" v-on:click="save" />
        </center>
      </template>
    </v-overlay>
    <v-overlay
      ref="reinfoSearch"
      class="search"
      @opened="openedSearch"
      header="Busqueda REINFO"
      v-model="o"
    >
      <template>
        <div v-show="!sizeR">
          <ul class="v-tabs" style="text-align: center; margin: 5px">
            <li
              @click="o.reinfoTab = 1"
              :class="{ 'v-selected': o.reinfoTab == 1 }"
            >
              Por RUC
            </li>
            <li
              @click="o.reinfoTab = 2"
              :class="{ 'v-selected': o.reinfoTab == 2 }"
            >
              Por Nombre
            </li>
            <li
              @click="o.reinfoTab = 3"
              :class="{ 'v-selected': o.reinfoTab == 3 }"
            >
              Por Lista General
            </li>
          </ul>
          <div class="v-form" style="margin: 5px">
            <input
              v-if="o.reinfoTab == 1"
              v-model="filters.ruc"
              placeholder="Ingrese RUC"
            />
            <input
              v-if="o.reinfoTab == 2"
              v-model="filters.dermin"
              placeholder="Ingrese Derecho Minero o Minero Inf."
            />
            <template v-if="o.reinfoTab == 3">
              <label>Provincia:</label>
              <v-select
                ref="provinceSelect"
                v-model="filters.idProvR"
                @input="
                  $refs.districtSelectR
                    ? $refs.districtSelectR.load({
                        idDpto: '02',
                        idProv: filters.idProvR,
                      })
                    : 0
                "
              >
                <option>Seleccionar Opción</option>
                <v-options
                  url="/admin/directory/api/province/0/0?regionId=02"
                  value-field="pk.idProv"
                  display-field="name"
                />
              </v-select>
              <template v-show="filters.idProvR">
                <label>Distrito:</label>
                <v-select
                  ref="districtSelectR"
                  v-model="filters.districtR"
                  :disabled="!filters.idProvR"
                >
                  <option value="">Seleccionar Opción</option>
                  <v-options
                    url="/admin/directory/api/district/0/0"
                    display-field="name"
                  />
                </v-select>
              </template>
            </template>
            <div class="center">
              <v-button
                style="margin-top: auto auto; margin-top: 5px; width: auto"
                value="BUSCAR"
                @click="refresh2($refs.reinfoTable)"
              />
              <div
                v-if="sizeR === 0"
                class="yellow alert"
                style="margin-top: 10px"
              >
                No existe registros con el valor ingresado!
              </div>
            </div>
          </div>
        </div>
        <v-table
          ref="reinfoTable"
          v-show="sizeR"
          style="width: 100%"
          height="100"
          scrollable="true"
          src="/admin/drem/api/reinfo"
          @loaded="
            ss($event.target);
            sizeR = $event.target.size;
          "
          :selectable="false"
          :autoload="false"
          :filters="filtersR"
          :pagination="20"
        >
          <template v-slot:default="{ row, index }">
            <td width="50" header="#">
              <v-filter>
                <input disabled />
              </v-filter>
              {{ pad(index + 1, 4) }}
            </td>
            <td width="50" header="Ver" class="center">
              <v-filter>
                <input disabled />
              </v-filter>
              <template v-if="isValidLocation(row)"
                ><a class="ic-marker" @click="openi(row, 1)"></a
              ></template>
            </td>
            <td width="170" header="DISTRITO">
              <v-filter>
                <input v-model="filtersR.district" />
              </v-filter>
              {{ row.district }}
            </td>
            <td class="center" width="120" header="RUC">
              <v-filter>
                <input v-model="filtersR.ruc" />
              </v-filter>
              {{ row.ruc }}
            </td>
            <td width="200" header="DERECHO MIN">
              <v-filter>
                <input v-model="filters.derechoMi" />
              </v-filter>
              {{ row.derechoMi }}
            </td>
            <td width="250" header="MINERO INF">
              <v-filter>
                <input v-model="filters.mineroInf" />
              </v-filter>
              {{ row.mineroInf }}
            </td>
            <td width="150" header="ESTADO">
              <v-filter>
                <input v-model="filters.estado" />
              </v-filter>
              {{ row.estado }}
            </td>
            <td width="200" header="TIPO ACTIV">
              <v-filter>
                <input v-model="filters.tipoActiv" />
              </v-filter>
              {{ row.tipoActiv }}
            </td>
          </template>
        </v-table>
      </template>
      <template v-if="sizeR" v-slot:footer>
        <div class="right">
          <v-button
            icon="fa-arrow-left"
            value="Regresar"
            class="on"
            @click.prevent="sizeR = null"
          ></v-button>
          <div style="display: inline-block; float: left; padding: 4px">
            Registros encontrados ({{ sizeR }})
          </div>
          <v-button
            icon="fa-sync"
            class="on"
            @click.prevent="$refs.reinfoTable.load()"
          ></v-button>
        </div>
      </template>
    </v-overlay>
    <v-overlay ref="overlay" :header="'Detalle'" @zoom="zzz" v-model="o.order">
      <template v-if="o.order">
        <v-fieldset
          :legend="o.description"
          v-for="(o, i) in o.order"
          :key="'k1-' + i"
          style="border: 1px solid gray"
        >
          <div class="map-info" v-for="(o, j) in o" :key="'k2-' + i + '-' + j">
            <table class="v-table">
              <tr
                v-for="(v, k) in o.properties"
                :key="'k3-' + i + '-' + j + '-' + k"
              >
                <td width="50%">{{ k }}</td>
                <td class="right">{{ v }}</td>
              </tr>
            </table>
          </div>
        </v-fieldset>
        <div style="font-size: 12px; margin-top: 10px">
          <div>EPSG:4326={{ lastCoordinate0 }}</div>
          <div>EPSG:3857={{ lastCoordinate }}</div>
        </div>
      </template>
    </v-overlay>
    <v-map-control
      style="top: 80px; height: 58px; width: 58px; left: 8px"
      class="ic-42"
    >
      <button
        @click="
          $refs.layerControl.setScope(0);
          $refs.overlay.close();
        "
      >
        <img style="padding: 3px" src="@/fs/images/ancash.svg" />
      </button>
    </v-map-control>
    <!--v-map-control v-show="false&&coordinate&&coordinate.length" class="ol-selectable" 
			style="color:black;top: 10px;left: 2.8em;padding:5px;">
			<div v-if="coordinate&&coordinate.length">({{coordinate[0]}},{{coordinate[1]}})</div>
		</v-map-control-->
    <v-map-control class="ol-horizontal" style="top: 8px; left: 50px">
      <v-button icon="fa-layer-group" @click="showLayers = !showLayers" />
      <v-button
        icon="fa-draw-polygon"
        @click="
          $refs.overlay.close();
          drawing = !!!drawing;
        "
      />
      <v-button
        icon="fa-download"
        @click="$refs.printer.open({ map: $refs.map.map })"
      />
    </v-map-control>

    <v-map-control
      v-if="showLayers"
      style="
        overflow-y: auto;
        max-height: calc(100% - 178px);
        -top: 140px;
        bottom: 48px;
        width: calc(100% - 15px);
        max-width: 380px;
      "
      class="summary ol-selectable"
    >
      <ul>
        <li
          v-for="(group, key) in groups"
          v-show="group.children.length"
          :key="'li-' + key"
        >
          <div>
            <span
              @click="group.expanded = !group.expanded"
              v-show="!!group.expanded"
              ><i class="fa fa-minus" style="width: 24px"></i
            ></span>
            <span
              @click="group.expanded = !group.expanded"
              v-show="!group.expanded"
              ><i class="fa fa-plus" style="width: 24px"></i
            ></span>
            <v-checkbox
              v-model="group.checked"
              style="display: inline-block; width: calc(100% - 24px)"
              @input="checked(group)"
              :label="group.name"
            />
          </div>
          <ul
            v-show="group.expanded"
            style="paddingleft: 54px; list-style-type: none"
          >
            <li v-for="(l, i) in group.children" :key="'layer-' + i">
              <v-checkbox
                v-model="l.ver"
                @input="ch(l)"
                :label="l.description"
              />
            </li>
            <li v-if="key == 0" class="item-icon">
              <div>
                <span style="background-color: brown"></span
                ><span>EXTINGIDO</span>
              </div>
              <div>
                <span style="background-color: red"></span><span>OTROS</span>
              </div>
              <div>
                <span style="background-color: blue"></span
                ><span>TITULADO</span>
              </div>
              <div>
                <span style="background-color: green"></span
                ><span>TRAMITE</span>
              </div>
            </li>
            <li v-if="key == 1" class="item-icon">
              <div>
                <span style="background-color: blue; border-radius: 50%"></span
                ><span>VIGENTE</span>
              </div>
              <div>
                <span style="background-color: red; border-radius: 50%"></span
                ><span>SUSPENDIDO</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </v-map-control>
    <v-map-control
      @click="$refs.optionsSearch.toggle()"
      icon="fa-search"
      style="top: 44px; right: 0.5em"
    ></v-map-control>
    <v-map-control
      ref="optionsSearch"
      :visible="0"
      style="
        display: none;
        cursor: pointer;
        padding: 5px 10px !important;
        top: 44px;
        right: 2.45em;
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.7);
      "
    >
      <a @click="opensearch(0)"> CONCESIONES </a> |
      <a @click="opensearch(1)"> REINFO </a>
    </v-map-control>
    <v-map-control
      style="
        display: none;
        cursor: pointer;
        padding: 5px 10px !important;
        bottom: 10px;
        left: 0.5em;
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.7);
      "
    >
      Nº de visitas: {{ count }}
    </v-map-control>
    <v-map-control
      @click="
        showConvertor = !showConvertor;
        $refs.overlay.close();
        $refs.search.close();
      "
      icon="fa-bullseye"
      style="top: 80px; right: 0.5em"
    ></v-map-control>
    <v-map-control
      v-if="showConvertor"
      class="v-form"
      style="padding: 10px; top: 110px; right: 0.5em"
    >
      <label>{{ conv.projection == "UTM" ? "Este" : "Longitud" }}:</label>
      <v-number v-model="conv.lon" decimal="10" />
      <label>{{ conv.projection == "UTM" ? "Norte" : "Latitud" }}:</label>
      <v-number v-model="conv.lat" decimal="10" />
      <label>Proyección:</label>
      <select v-model="conv.projection">
        <option value="EPSG:3857">EPSG:3857</option>
        <option value="EPSG:4326">EPSG:4326</option>
        <option value="UTM">UTM</option>
      </select>
      <template v-if="conv.projection == 'UTM'">
        <label>Zona:</label>
        <select v-model="conv.zone">
          <option value="17">17</option>
          <option value="18">18</option>
        </select>
      </template>
      <v-button
        :disabled="!conv.lon || !conv.lat"
        style="margin-top: 10px"
        @click="transform2"
        value="IR"
      />
    </v-map-control>
    <div
      ref="splash"
      class="splash"
      style="
        display: none;
        width: -webkit-fill-available;
        background-color: white;
      "
    >
      <div
        class="margin-b center"
        style="background-color: #2b57b5; color: white; padding: 20px"
      >
        <div>
          <div style="display: inline-block; height: 130px">
            <img
              style="float: left"
              src="https://www.regionancash.gob.pe/images/principal/menu_secundario_pagina/sicamif.png"
            />
          </div>
          <div style="display: inline-block; font-size: 60px">SICAMIF</div>
        </div>
        Sistema de Información Catastral Minero y Formalización
      </div>
      <div style="padding: 20px;position:relative;">
        <ul
          style="
            list-style-image: url('https://www.regionancash.gob.pe/images/principal/menu_secundario_pagina/sicamif.png');
          "
        >
          <li>
            <a
              class="_"
              target="blank"
              href="http://web.regionancash.gob.pe/fs/aviso.pdf"
              >Comunicado</a
            >
          </li>
          <li>
            <a
              class="_"
              target="blank"
              href="http://web.regionancash.gob.pe/fs/sicamif/manual.pdf"
              >Manual de uso de la plataforma</a
            >
          </li>
        </ul>
        <div class="logo margin-b">
          <a href="https://premiobpg.pe/ganadores/" target="_premiobpg">
            <img
              width="200"
              style="padding: 3px"
              src="http://web.regionancash.gob.pe/fs/images/BPG2022.png"
            />
          </a>
        </div>
        <div class="center" style="margin-top:10px;">
          <v-button value="INGRESAR" @click="close($refs.splash)" />
        </div>
      </div>
    </div>
    <div
      ref="msg"
      class="center"
      style="display: none; padding: 20px; background-color: white"
    >
      <div class="margin-b">
        <img
          src="https://icons.iconarchive.com/icons/hopstarter/sleek-xp-basic/24/Close-2-icon.png"
        />
      </div>
      <div class="margin-b bold">Datos incorrectos</div>
      <div class="margin-b">
        Los datos ingresados no son válidos, intenta nuevamente
      </div>
      <v-button value="CERRAR" @click="close($refs.msg)" />
    </div>
    <v-map-control
      style="bottom: 60px; height: 58px; width: 200px; right: 8px"
      class="ic-42"
    >
      <a href="https://premiobpg.pe/ganadores/" target="_premiobpg">
        <img
          style="padding: 3px"
          src="http://web.regionancash.gob.pe/fs/images/BPG2022.png"
        />
      </a>
    </v-map-control>
  </v-map>
</template>
<script>
import "ol/ol.css";
import Feature from "ol/Feature";
import { getArea, getLength } from "ol/sphere";
import Draw from "ol/interaction/Draw";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import TileWMS from "ol/source/TileWMS";
import { Circle as CircleStyle, Fill, Stroke } from "ol/style";
import ImageWMS from "ol/source/ImageWMS";
import Image from "ol/layer/Image";
import { LineString, Polygon } from "ol/geom";
import { listen } from "ol/events";
import * as olProj from "ol/proj";
import EventType from "ol/pointer/EventType.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection, getTransformFromProjections } from "ol/proj.js";
import { unByKey } from "ol/Observable";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import Overlay from "ol/Overlay";

var ol = window.ol;
ol.style.Icon = Icon;
ol.style.Feature = Feature;
ol.source.TileWMS = TileWMS;
ol.source.ImageWMS = ImageWMS;
ol.layer.Image = Image;

export default window.ui({
  mounted() {
    var me = this;
    me.ic = require("@/fs/images/ancash.svg");
    me.markerIcon = require("@/fs/images/marker-azure.png");
    setTimeout(function () {
      me.$refs.splash.closeOnClickOut = 1;
      me.open(me.$refs.splash, { closeOnClickOut: 1 });
    }, 200);
    fetch("http://web.regionancash.gob.pe:1131", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: "drenergiaminas_ancash/map" }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        me.count = data;
      });
  },
  data() {
    return {
      format: "pdf",
      draw: null,
      source: null,
      sketch: null,
      drawing: null,
      helpTooltipElement: null,
      helpTooltip: null,
      measureTooltipElement: null,
      measureTooltip: null,
      continuePolygonMsg: "Click to continue drawing the polygon",
      continueLineMsg: "Click to continue drawing the line",
      count: 0,
      filtersC: { code: null, concon: null, province: null, district: null },
      filtersR: { ruc: null, concon: null, province: null, district: null },
      mousePositionControl: null,
      conv: { projection: "UTM", lat: null, lon: null, zone: null },
      coordinate: null,
      lastCoordinate0: null,
      lastCoordinate: null,
      transform: null,
      marker: null,
      groups: [],
      showLayers: true,
      showConvertor: true,
      filters2: {},
      layers: [],
      markerIcon: null,
      ic: null,
      sizeC: null,
      sizeR: null,
      /*filters: {type: 'rest'}, */ o: {
        concesionTab: 1,
        reinfoTab: 1,
        order: null,
        id: null,
      },
    };
  },
  watch: {
    drawing(nv) {
      var me = this,
        map = me.$refs.map.map,
        draw = me.draw;
      if (nv) {
        map.addInteraction(draw);
      } else map.removeInteraction(draw);
    },
  },
  methods: {
    tableLoaded(e) {
      console.log(e);
    },
    createHelpTooltip() {
      var me = this,
        helpTooltipElement = me.helpTooltipElement,
        helpTooltip = me.helpTooltip,
        map = me.$refs.map.map;
      if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
      }
      console.log("SE CREA EL ELEMENTO createHelpTooltip!");
      helpTooltipElement = document.createElement("div");
      helpTooltipElement.className = "ol-tooltip hidden ol-tooltip-measure";
      helpTooltip = new Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: "center-left",
      });
      map.addOverlay(helpTooltip);
      me.helpTooltip = helpTooltip;
      me.helpTooltipElement = helpTooltipElement;
    },
    isValidLocation(row) {
      return row.zone > 0;
    },
    createMeasureTooltip() {
      var me = this,
        measureTooltipElement = me.measureTooltipElement,
        measureTooltip = me.measureTooltip,
        map = me.$refs.map.map;
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement("div");
      measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false,
        insertFirst: false,
      });
      me.measureTooltipElement = measureTooltipElement;
      map.addOverlay((me.measureTooltip = measureTooltip));
    },
    addInteraction() {
      var me = this,
        sketch = me.sketch,
        formatArea = me.formatArea,
        formatLength = me.formatLength,
        createMeasureTooltip = me.createMeasureTooltip;
      const type = /*typeSelect.value == 'area' ? 'Polygon' : */ "Polygon"; //LineString
      var draw = new Draw({
        source: me.source,
        type: type,
        style: new Style({
          fill: new Fill({
            color: "yellow",
          }),
          stroke: new Stroke({
            color: "blue",
            lineDash: [10, 10],
            width: 3,
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.7)",
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          }),
        }),
      });

      me.createMeasureTooltip();
      me.createHelpTooltip();
      let listener;
      draw.on("drawstart", function (evt) {
        if (me.drawing) {
          sketch = evt.feature;
          let tooltipCoord = evt.coordinate;
          listener = sketch.getGeometry().on("change", function (evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof Polygon) {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              output = formatLength(geom);
              tooltipCoord = geom.getLastCoordinate();
            }
            me.measureTooltipElement.innerHTML = output;
            me.measureTooltip.setPosition(tooltipCoord);
          });
        }
      });
      draw.on("drawend", function () {
        me.measureTooltipElement.className =
          "ol-tooltip ol-tooltip-static ol-tooltip-measure";
        me.measureTooltip.setOffset([0, -7]);
        // unset sketch
        me.sketch = null;
        // unset tooltip so that a new one can be created
        me.measureTooltipElement = null;
        createMeasureTooltip();
        unByKey(listener);
      });
      me.draw = draw;
    },
    formatLength(line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " " + "km";
      } else {
        output = Math.round(length * 100) / 100 + " " + "m";
      }
      return output;
    },
    formatArea(polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output =
          Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
      } else {
        output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
      }
      return output;
    },
    pointerMoveHandler(evt) {
      if (!this.drawing) return;
      var me = this,
        sketch = me.sketch;
      if (evt.dragging) {
        return;
      }
      let helpMsg = "Click to start drawing";
      if (sketch) {
        const geom = sketch.getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = me.continuePolygonMsg;
        } else if (geom instanceof LineString) {
          helpMsg = me.continueLineMsg;
        }
      }
      me.helpTooltipElement.innerHTML = helpMsg;
      me.helpTooltip.setPosition(evt.coordinate);
      me.helpTooltipElement.classList.remove("hidden");
    },
    refresh2(t) {
      var me = this,
        o = me.o;
      for (const key in me.filtersR) me.filtersC[key] = null;
      if (t.$vnode.data.ref == "reinfoTable") {
        switch (o.reinfoTab) {
          case 1:
            me.filtersR.ruc = me.filters.ruc;
            break;
          case 2:
            me.filtersR.dermin = me.filters.dermin;
            break;
          case 3:
            me.filtersR.district = me.filters.districtR.name;
        }
      } else {
        for (const key in me.filtersC) me.filtersC[key] = null;
        switch (o.concesionTab) {
          case 1:
            me.filtersC.code = me.filters.code;
            break;
          case 2:
            me.filtersC.concon = me.filters.concon;
            break;
          case 3:
            me.filtersC.district = me.filters.districtC.name;
        }
      }
      console.log(me.filtersR);
      setTimeout(() => {
        t.load();
      }, 500);
    },
    ss(t) {
      t.resize(t.$el.parentNode.clientHeight);
    },
    zzz() {
      var map = this.$refs.map.map;
      var overlay = this.$refs.overlay.overlay;
      if (this.$refs.overlay.coordinate && overlay.getPosition()) {
        var cc = map.getPixelFromCoordinate(this.$refs.overlay.coordinate);
        cc[0] = cc[0] + this.$refs.overlay.$el.offsetWidth / 2;
        overlay.setPosition(map.getCoordinateFromPixel(cc));
      }
    },
    openedSearch(e) {
      e.target.$children[0].$el.style.heigth =
        e.target.$el.children[1].offsetHeight + "px";
      var table = e.target.$children[0];
      table.$el.style.heigth = e.target.$el.children[1].offsetHeight + "px";
      var event = new Event("parentResize", { bubbles: true });
      event.height = e.target.$el.children[1].offsetHeight;
      table.$el.dispatchEvent(event);
    },
    checked(group) {
      group.children.forEach((e) => {
        e.ver = group.checked;
        e.setVisible(!!e.ver);
      });
    },
    scope() {},
    opensearch(i) {
      var me = this,
        refs = me.$refs,
        map = refs.map.map;
      refs.optionsSearch.toggle();
      me.size = null;
      if (i) {
        refs.reinfoSearch.open({ map: map });
      } else refs.search.open({ map: map });
    },
    openi(e, r) {
      var me = this;
      var map = this.$refs.map.map;
      console.log(e);
      console.log(r);
      if (e.este) e = me.utmToLatLng(e.zone, e.este, e.norte);
      else e = me.utmToLatLng(e.zone, e.esteWgs84, e.norteWgs8);

      console.log(e);
      var c = this.groups[r ? r : 0];
      c.checked = 1;
      me.checked(c);
      me.click({ map: map, coordinate: olProj.fromLonLat([e.lon, e.lat]) });
      me.$refs.reinfoSearch.close();
      me.$refs.search.close();
      me.showConvertor = 0;
    },
    click(evt) {
      var me = this;
      if (me.drawing) return;
      var map = me.$refs.map;
      var view = map.map.getView();
      var viewResolution = view.getResolution();
      var d = [];
      me.o.order = d;
      me.lastCoordinate0 = evt.coordinate;
      if (me.transform) {
        var coord = map.map.getCoordinateFromPixelInternal(
          map.map.getEventPixel(event)
        );
        me.transform(coord, coord);
        me.lastCoordinate = coord;
      }
      if (evt.marker) {
        if (!me.marker) {
          map.map.on("click", function (e) {
            map.map.forEachFeatureAtPixel(e.pixel, function (feature) {
              if (me.marker == feature) {
                me.click({
                  map: map.map,
                  coordinate: me.marker.getGeometry().getCoordinates(),
                });
              }
            });
          });
          me.marker = map.addFeature(
            {
              lon: evt.coordinate[0],
              lat: evt.coordinate[1],
              layer: "marker",
              draggable: true,
              style: new Style({
                image: new Icon({
                  anchor: [0.5, 32],
                  anchorXUnits: "fraction",
                  anchorYUnits: "pixels",
                  src: me.markerIcon,
                }),
              }),
            },
            { zoom: view.getZoom() }
          );
        } else {
          me.marker.setGeometry(new ol.geom.Point(evt.coordinate));
          view.animate({
            center: me.marker.getGeometry().getCoordinates(),
            zoom: view.getZoom(),
            duration: 500,
          });
        }
        return;
      }
      for (var k = 0; me.layers.length > k; k++) {
        var untiled = me.layers[k];
        if (untiled.get("visible")) {
          console.log(untiled);
          var source = untiled.getSource();
          if (source.getFeatureInfoUrl) {
            var url = source.getFeatureInfoUrl(
              evt.coordinate,
              viewResolution,
              view.getProjection(),
              { INFO_FORMAT: "application/json", FEATURE_COUNT: 50 }
            );
            if (url) {
              fetch(url)
                .then((response) => {
                  var url = new URL(response.url);
                  return [url.searchParams.get("LAYERS"), response.json()];
                })
                .then((data) => {
                  data[1].then(function (d2) {
                    if (d2.features.length) {
                      d2.features.description = data[0];
                      me.layers.forEach((e) => {
                        console.log(e.address + "==" + data[0]);
                        if (e.address.trim() == data[0].trim()) {
                          d2.features.description = e.description;
                          console.log(e.description);
                        }
                      });

                      d.push(d2.features);
                      //debe ordenarse d por peso
                      map.animate({
                        center: evt.coordinate,
                        zoom: 14,
                        duration: 500,
                        complete() {
                          me.$refs.overlay.open(evt);
                        },
                      });
                    }
                  });
                });
            }
          }
        }
      }
    },
    utmToLatLng(zone, easting, northing, northernHemisphere) {
      if (!northernHemisphere) {
        northing = 10000000 - northing;
      }
      var a = 6378137;
      var e = 0.081819191;
      var e1sq = 0.006739497;
      var k0 = 0.9996;
      var arc = northing / k0;
      var mu =
        arc /
        (a *
          (1 -
            Math.pow(e, 2) / 4.0 -
            (3 * Math.pow(e, 4)) / 64.0 -
            (5 * Math.pow(e, 6)) / 256.0));
      var ei =
        (1 - Math.pow(1 - e * e, 1 / 2.0)) / (1 + Math.pow(1 - e * e, 1 / 2.0));
      var ca = (3 * ei) / 2 - (27 * Math.pow(ei, 3)) / 32.0;

      var cb = (21 * Math.pow(ei, 2)) / 16 - (55 * Math.pow(ei, 4)) / 32;
      var cc = (151 * Math.pow(ei, 3)) / 96;
      var cd = (1097 * Math.pow(ei, 4)) / 512;
      var phi1 =
        mu +
        ca * Math.sin(2 * mu) +
        cb * Math.sin(4 * mu) +
        cc * Math.sin(6 * mu) +
        cd * Math.sin(8 * mu);

      var n0 = a / Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 1 / 2.0);

      var r0 =
        (a * (1 - e * e)) /
        Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 3 / 2.0);
      var fact1 = (n0 * Math.tan(phi1)) / r0;

      var _a1 = 500000 - easting;
      var dd0 = _a1 / (n0 * k0);
      var fact2 = (dd0 * dd0) / 2;

      var t0 = Math.pow(Math.tan(phi1), 2);
      var Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
      var fact3 =
        ((5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4)) /
        24;

      var fact4 =
        ((61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) *
          Math.pow(dd0, 6)) /
        720;

      var lof1 = _a1 / (n0 * k0);
      var lof2 = ((1 + 2 * t0 + Q0) * Math.pow(dd0, 3)) / 6.0;
      var lof3 =
        ((5 -
          2 * Q0 +
          28 * t0 -
          3 * Math.pow(Q0, 2) +
          8 * e1sq +
          24 * Math.pow(t0, 2)) *
          Math.pow(dd0, 5)) /
        120;
      var _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);
      var _a3 = (_a2 * 180) / Math.PI;

      var latitude = (180 * (phi1 - fact1 * (fact2 + fact3 + fact4))) / Math.PI;
      if (!northernHemisphere) {
        latitude = -latitude;
      }
      var longitude = ((zone > 0 && 6 * zone - 183.0) || 3.0) - _a3;
      var obj = {
        lat: latitude,
        lon: longitude,
      };
      return obj;
    },
    transform2() {
      /*
			Min X: -20026376.39
Min Y: -20048966.10
Max X: 20026376.39
Max Y: 20048966.10
			*/
      var me = this,
        map = me.$refs.map.map;
      if (me.conv.projection) {
        var e = me.utmToLatLng(me.conv.zone, me.conv.lon, me.conv.lat);
        let coordinate = [e.lon, e.lat];
        //console.log(coordinate);
        coordinate = olProj.fromLonLat(coordinate);
        if (
          coordinate[0] < -8790359 ||
          coordinate[0] > -8492726 ||
          coordinate[1] < -1234636 ||
          coordinate[1] > -858160
        )
          me.open(me.$refs.msg);
        else {
          me.click({ map: map, marker: 1, coordinate: coordinate });
          me.$refs.search.close();
          me.showConvertor = 0;
        }
        return;
      }
      const projection = getProjection(me.conv.projection);
      var transform_;
      if (projection) {
        transform_ = getTransformFromProjections(
          map.getView().getProjection(),
          projection
        );
        me.transform = transform_;
        var coordinate = [me.conv.lon, me.conv.lat]; //map.getCoordinateFromPixelInternal(map.getEventPixel(e));
        transform_(coordinate, coordinate);
        //console.log(coordinate);
        //console.log(olProj.fromLonLat(coordinate));
        coordinate = olProj.fromLonLat(coordinate);
        if (
          coordinate[0] < -8790359 ||
          coordinate[0] > -8492726 ||
          coordinate[1] < -1234636 ||
          coordinate[1] > -858160
        )
          me.open(me.$refs.msg);
        else {
          me.click({ map: map, marker: 1, coordinate: coordinate });
          me.$refs.search.close();
          me.showConvertor = 0;
        }
      }
    },
    mapBuild(e) {
      var me = this,
        map = e.map;
      var viewport = map.getViewport();
      proj4.defs(
        "EPSG:32617",
        "+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs"
      );
      //proj4.defs('EPSG:32722', '+proj=utm +zone=17 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');
      register(proj4);
      /*var firstProjection = "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs";
			var secondProjection = "+proj=utm +zone=17 +ellps=GRS80 +units=m +no_defs";
			var result = proj4(firstProjection,secondProjection, [-9.814363094,-78.0593282]);
			console.log(result);*/
      var utm = "+proj=utm +zone=17";
      var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
      console.log(proj4(utm, wgs84, [539884, 4942158]));
      const projection = getProjection("EPSG:4326");
      var transform_;
      if (projection) {
        transform_ = getTransformFromProjections(
          map.getView().getProjection(),
          projection
        );
        me.transform = transform_;
      }
      listen(
        viewport,
        EventType.POINTERMOVE,
        (e) => {
          var coordinate = map.getCoordinateFromPixelInternal(
            map.getEventPixel(e)
          );
          transform_(coordinate, coordinate);
          me.coordinate = coordinate;
        },
        this
      );
      map.on("click", me.click);

      window.axios.get("/admin/drem/api/layer/group").then((r) => {
        r.data.forEach((e) => {
          me.groups.push({
            name: e.name,
            id: e.id,
            expanded: false,
            checked: false,
            children: [],
          });
        });
        window.axios.get("/admin/drem/api/layer/0/100").then((r) => {
          var la = r.data.data;
          for (var j = 0; la.length > j; j++) {
            var layer = la[j];
            var oLayer = ol.layer.Tile;
            var source = ol.source.TileWMS;
            if (la[j].type == "I") {
              oLayer = ol.layer.Image;
              source = ol.source.ImageWMS;
            }
            var dd = layer.address.split(":");
            var par = {
              LAYERS: layer.address,
              TILED: true,
            };
            if (layer.styles) par.STYLES = layer.styles;
            var l = new oLayer({
              source: new source({
                url: me.baseURL + "/geoserver/" + dd[0] + "/wms",
                params: par,
                serverType: "geoserver",
                // Countries have transparency, so do not fade tiles:
                transition: 0,
              }),
            });
            l.description = layer.name;
            l.id = layer.id;
            l.address = layer.address.trim();
            l.ver = layer.visible;
            l.setVisible(l.ver);

            me.groups.forEach((group, i) => {
              if (layer.groupId == group.id) {
                if (l.ver) {
                  me.groups[i].checked = 1;
                }
                me.groups[i].children.push(l);
              }
            });

            e.addLayer(l);
            //layer.getSource().updateParams({'STYLES': 'style_1'});
          }
        });
      });
      map.on("pointermove", me.pointerMoveHandler);
      map.getViewport().addEventListener("mouseout", function () {
        if (me.helpTooltipElement)
          me.helpTooltipElement.classList.add("hidden");
      });
      const source = new VectorSource();
      me.source = source;
      const vector = new VectorLayer({
        source: source,
        style: new Style({
          fill: new Fill({
            color: "rgba(100, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#00cc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#00cc33",
            }),
          }),
        }),
      });
      vector.setZIndex(parseInt(1000));
      map.addLayer(vector);
      me.addInteraction();
    },
    ch(e) {
      e.setVisible(!!e.ver);
    },
    addlayer(e) {
      if (e.description) {
        this.layers.push(e);
      }
    },
    layerOnChange(evt) {
      var me = this;
      var f = evt.feature;
      if (f.values_) {
        if (f.values_.data[2]) {
          this.o.id = f.values_.data[2];
          var view = evt.map.getView();
          view.animate(
            {
              center: f.getGeometry().getCoordinates(),
              zoom: 17 > view.getZoom() ? 17 : view.getZoom(),
              duration: 500,
            },
            function () {
              me.$refs.overlay.open(evt);
            }
          );
        } else {
          console.log(f.values_.data);
        }
      }
    },
    save() {
      var me = this,
        l = [];
      me.layers.forEach((e) => {
        if (e.get("visible")) l.push(e.address);
      });
      me.saveAs("/api/geoserver/", {
        layers: l,
      });
    },
    layerLoad(/*o*/) {
      //var data = o.data;
      //console.log(data);
      /*var style = function (f) {
				return [
					new ol.style.Style({
						image: new ol.style.Circle({
							radius: 14,
							stroke: new ol.style.Stroke({
								color: '#8a0000',
								width: 1
							}),
							fill2: new ol.style.Fill({
								color: 'orange'
							})
						})
					}),
					new ol.style.Style({
						image: new ol.style.Icon({
							scale: 0.85,
							src: require('@/admin/dircetur/icons/' + (f.values_.data[4] == 'rest' ? 'restaurant' : 'hotel') + '.png')
						}),
						text2: new ol.style.Text({
							text: f.values_.data[4] == 'rest' ? '\uf0f5' : '\uf236',
							font: 'normal 18px FontAwesome'
						})
					})
				]
			};*/
      /*for (var i = 0; data.length > i; i++) {
				var d = data[i];
				if (0 > parseFloat(d[0])) {
					//console.log(parseFloat(d[0])+' ; '+parseFloat(d[1]));
					var f = new ol.Feature({
						geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(d[0]), parseFloat(d[1])])),
						data: d
					});
					f.setStyle(style);
					o.features.push(f);
				}
			}*/
    },
  },
});
</script>
<style scope>
.ol-tooltip-measure {
  color: blue;
  background-color: white;
  border-radius: 5px;
  padding: 5px;
  opacity: 0.5;
}
.splash li {
  margin: 0;
  padding: 14px 0 14px 58px;
  list-style: none;
  background-image: url(https://www.regionancash.gob.pe/images/principal/menu_secundario_pagina/sicamif.png);
  background-repeat: no-repeat;
  background-position: left center;
  background-size: 40px;
}
.map-info .v-table {
  border: 1px solid gray;
}
.map-info:not(:last-child) {
  margin-bottom: 10px;
}
.map-info .v-table td {
  padding: 5px;
  line-break: anywhere;
}
.search {
  width: 100%;
}
.search .v-ol-body {
  padding: 0px !important;
}
.search .v-panel-titlebar {
  padding-left: 30px !important;
  background-size: 20px;
  background-position: 5px;
  background-repeat: no-repeat;
  background-image: url(https://web.regionancash.gob.pe/fs/images/favicon.png);
}
.search .v-ol-body input {
  color: black;
}
.ui-selectlistbox-listcontainer {
  height: auto !important;
}
#icon-ancash {
  color: white;
  fill: red;
}
.item-icon > div > span:nth-child(1) {
  margin-left: 1px;
  margin-top: 2px;
  margin-right: 10px;
  display: inline-block;
  width: 24px;
  height: 24px;
}
.item-icon > div > span:nth-child(2) {
  display: inline-block;
  margin-left: 0px;
  margin-top: 5px;
  margin-right: 10px;
  float: right;
  display: inline-block;
  width: calc(100% - 45px);
}
.ic-42 {
  background-image: url(/img/ancash.177e7438.svg);
  background-repeat: no-repeat;
  background-size: 40px 40px;
  background-position: 4px 4px;
  fill: #ab4444 !important;
}
.ic-marker {
  background-image: url(./fs/images/marker.png);
  background-repeat: no-repeat;
  background-size: 24px 24px;
  width: 24px;
  height: 24px;
  cursor: pointer;
}
.ic-42 path {
  fill: red;
}
.ic-42 button {
  width: -webkit-fill-available !important;
  height: -webkit-fill-available !important;
}
.ui-button {
  margin-right: 0px !important;
}
.ui-selectonelistbox {
  padding: 0px;
}
[data-type="tourist"] {
  border: 1px #2f6126 solid !important;
  background-color: #afffaf;
}
.container {
  position: relative;
  padding-top: 25%;
  float: left;
  display: inline-block;
  margin-right: -4px;
  border: 1px solid gray;
  width: calc(33.33% - 2px);
  margin: 0px !important;
  word-spacing: -1;
}
.text {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  text-align: center;
  overflow-y: hidden;
  color: white;
  opacity: 0.7;
}
.container .text {
  -webkit-transition: opacity 0.2s ease-in-out;
  -moz-transition: opacity 0.2s ease-in-out;
  -o-transition: opacity 0.2s ease-in-out;
  transition: opacity 0.2s ease-in-out;
}
.container:hover .text {
  opacity: 1;
}
@media (min-width: 700px) {
  .logo {
    float: right;
    top: 20px;
    right: 20px;
    position: absolute;
  }
}
@media (max-width: 700px) {
  .logo {
    text-align: center;
  }
  .as1 {
    width: calc(100% - 2px) !important;
    float: left !important;
    height: calc(100% - 2px) !important;
  }
  .as2 {
    width: calc(100% - 2px) !important;
    float: right !important;
    height: auto !important;
  }
  .container {
    width: calc(50% - 2px) !important;
    padding-top: 45%;
  }
}
#marker-tooltip {
  border-width: 0px !important;
  background-color: transparent;
  padding: 0px;
}
.x-dlg-header {
  border-radius: 4px 4px 0px 0px;
  background-color: #0f62ac;
  color: white;
  padding: 10px;
}
.x-dlg-body {
  border: 1px solid #a5a5a5;
  border-width: 0px 1px 0px 1px;
  background-color: white;
  height: 460px;
  overflow: auto;
}
.x-dlg-footer {
  text-align: right;
  border: 1px solid #a5a5a5;
  padding: 5px;
  border-width: 1px 1px 0px 1px;
  background-color: white;
}
.x-link {
  text-decoration: underline;
  color: #3399ff;
  cursor: pointer;
}
.summary {
  bottom: 44px;
  left: 0.5em;
  background-color: rgb(255 255 255 / 73%) !important;
  color: black;
  transition: background-color 1s;
}
.summary:hover {
  background-color: white !important;
}
.summary .v-checkbox {
  height: auto;
  margin-bottom: 3px;
}
ul.v-tabs li {
  display: inline-block;
  border: 1px solid gray;
  padding: 3px 5px;
  cursor: pointer;
}
.v-panel-titlebar {
  cursor: grab;
}
.ol-horizontal > button {
  float: right;
}
</style>