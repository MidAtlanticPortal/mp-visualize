/**
  * Forked from https://github.com/bojko108/ol-esri-style

  * This file was created by compiling the Node JS Module code from files
  *   * src/index.js
  *   * src/styles.js
  *   * src/formatters.js
  * into a single file, and then rewriting code that depends on Node and other
  * dependencies and in theory should work in a "vanilla" js environment,
  * assuming the OpenLayers library was included as well.

  * This work was performed in June, 2021, so it will not reflect any
  * updates made to the module files, and in fact may break Node build
  * processes.

  * This and all prior code is under the MIT licence.

  */

//////////////////////////////////////////////////////////////
////                    index.js                 ////////////
//////////////////////////////////////////////////////////////

/**
 * Map projection - used for labeling features
 * @type {import('ol/proj/Projection')}
 */
let mapProjection = null;

/**
 * // https://developers.arcgis.com/documentation/common-data-types/symbol-objects.htm
 * // https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-SimpleLineSymbol.html#style
 */
const lineDashPattern = {
  esriSLSDash: [10], // _ _ _ _
  esriSLSDashDot: [10, 10, 1, 10], // _ . _ .
  esriSLSDot: [1, 10, 1, 10], // . . . .
  esriSLSDashDotDot: [10, 10, 1, 10, 1, 10], // _ . . _ . .
  esriSLSSolid: [], // _________
};

/**
 * Set map projection used for labeling features
 * @param {import('ol/proj/Projection')} projection
 */
const setMapProjection = (projection) => {
  mapProjection = projection;
};

/**
 * Creates OpenLayers style function based on ESRI drawing info
 * @param {!String} layerUrl - ArcGIS REST URL to the layer
 * @return {Promise<Function>} function which styles features
 */
const createStyleFunctionFromUrl = async (layerUrl) => {
  console.log(layerUrl + '?f=json');
  const response = await fetch(
    layerUrl + '?f=json',
    {
      dataType: "jsonp"
    }
  );
  const esriStyleDefinition = await response.json();
  return await createStyleFunction(esriStyleDefinition);
};

/**
 * Creates OpenLayers style function based on ESRI drawing info
 * @param {!Object} esriLayerInfoJson
 * @param {import('./types').EsriRenderer} esriLayerInfoJson.renderer - see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm for more info
 * @param {Array<import('./types').EsriLabelDefinition>} esriLayerInfoJson.labelingInfo - see https://developers.arcgis.com/documentation/common-data-types/labeling-objects.htm for more info
 * @return {Promise<Function>} function which styles features
 */
const createStyleFunction = (esriLayerInfoJson) => {
  return new Promise((yes, no) => {
    let { featureStyles, labelStyles } = readEsriStyleDefinitions(esriLayerInfoJson.drawingInfo);
    for (let i = 0; i < featureStyles.length; i++) {
      featureStyles[i].style = createFeatureStyle(featureStyles[i]);
    }
    for (let i = 0; i < labelStyles.length; i++) {
      labelStyles[i].maxResolution = getMapResolutionFromScale(labelStyles[i].maxScale || 1000);
      labelStyles[i].minResolution = getMapResolutionFromScale(labelStyles[i].minScale || 1);
      labelStyles[i].label = labelStyles[i].text;
      labelStyles[i].style = new ol.style.Style({ text: createLabelStyle(labelStyles[i]) });
    }

    const styleFunction = (feature, resolution) => {
      let styles = [];
      const featureStyle = featureStyles.find(({ filters }) => {
        if (filters) {
          return filters.every(({ field, value, operator }) => {
            const currentValue = feature.get(field);
            switch (operator) {
              case 'in':
                const valuesIn = value.split(',').map((value) => value.toString());
                return valuesIn.indexOf(currentValue.toString()) > -1;

              case 'between':
                return value.lowerBound <= currentValue && currentValue <= value.upperBound;

              default:
                throw 'Invalid operator ' + operator;
            }
          });
        } else {
          // will return the first style (default one)
          return true;
        }
      });

      if (featureStyle) {
        styles.push(featureStyle.style);
      }

      const labelStyle = labelStyles.find((label) => {
        return label.maxResolution >= resolution && resolution >= label.minResolution;
      });

      if (labelStyle && labelStyle.style) {
        const text = getFormattedLabel(feature, labelStyle.label);
        labelStyle.style.getText().setText(text);
        styles.push(labelStyle.style);
      }

      // push labels!

      return styles.length > 0 ? styles : null;
    };

    yes(styleFunction);
  });
};

/**
 * Reads ESRI Style definitions into readable style definition
 * @param {!Object} esriLayerInfoJson
 * @param {import('./types').EsriRenderer} esriLayerInfoJson.renderer - see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm for more info
 * @param {Array<import('./types').EsriLabelDefinition>} esriLayerInfoJson.labelingInfo - see https://developers.arcgis.com/documentation/common-data-types/labeling-objects.htm for more info
 * @return {Object} styles
 * @property {Array<import('./types').StyleType>} [styles.featureStyles]
 * @property {Array<import('./types').LabelType>} [styles.labelStyles]
 */
const readEsriStyleDefinitions = ({ renderer, labelingInfo }) => {
  if (!renderer) throw 'renderer is not defined';

  /**
   * @type {Array<import("./types").StyleType>}
   */
  let featureStyles = [];
  /**
   * @type {Array<import("./types").LabelType>}
   */
  let labelStyles = labelingInfo ? readLabels(labelingInfo) : [];

  switch (renderer.type) {
    case 'simple':
      featureStyles.push(readSymbol(renderer.symbol));
      break;
    case 'uniqueValue':
      const uniqueFieldValues = filterUniqueValues(renderer.uniqueValueInfos, renderer.fieldDelimiter);

      for (let i = 0; i < uniqueFieldValues.length; i++) {
        const uniqueField = uniqueFieldValues[i];

        /**
         * @type {Array<import("./types").FilterType>}
         */
        let filters = [];

        if (renderer.field1) {
          filters.push({
            field: renderer.field1,
            operator: 'in',
            value: uniqueField.field1Values,
          });
        }
        if (renderer.field2) {
          filters.push({
            field: renderer.field2,
            operator: 'in',
            value: uniqueField.field2Values,
          });
        }
        if (renderer.field3) {
          filters.push({
            field: renderer.field3,
            operator: 'in',
            value: uniqueField.field3Values,
          });
        }

        const style = readSymbol(uniqueField.symbol);
        featureStyles.push({
          filters,
          title: uniqueField.title,
          ...style,
        });
      }

      if (renderer.defaultSymbol) {
        featureStyles.push(readSymbol(renderer.defaultSymbol));
      }
      break;
    case 'classBreaks':
      const classBreakField = renderer.field;
      const classBreakMinValue = renderer.minValue;
      const classBreakInfos = renderer.classBreakInfos;
      for (let i = 0; i < classBreakInfos.length; ++i) {
        const classBreakInfo = classBreakInfos[i];
        const style = readSymbol(classBreakInfo.symbol);

        /**
         * @type {Array<import("./types").FilterType>}
         */
        const filters = [
          {
            field: classBreakField,
            operator: 'between',
            value: {
              lowerBound: classBreakInfo.hasOwnProperty('classMinValue') ? classBreakInfo.classMinValue : classBreakMinValue,
              upperBound: classBreakInfo.classMaxValue,
            },
          },
        ];

        featureStyles.push({
          filters,
          ...style,
        });
      }

      if (renderer.defaultSymbol) {
        featureStyles.push(readSymbol(renderer.defaultSymbol));
      }
      break;
    default:
      throw `"Renderer type "${renderer.type}" is not implemented yet`;
  }

  return { featureStyles, labelStyles };
};

/**
 * Reads label definitions for different map scales
 * @param {!Array<import('./types').EsriLabelDefinition>} labelingInfo
 * @return {Array<import('./types').LabelType>}
 */
const readLabels = (labelingInfo) => {
  return labelingInfo.map((labelDefinition) => {
    let labelStyle = readSymbol(labelDefinition.symbol);
    labelStyle.maxScale = labelDefinition.minScale || 1000;
    labelStyle.minScale = labelDefinition.maxScale || 0;
    labelStyle.text = (labelDefinition.labelExpression || '')
      .replace(/\[/g, '{')
      .replace(/\]/g, '}')
      .replace(/ CONCAT  NEWLINE  CONCAT /g, '\n')
      .replace(/ CONCAT /g, ' ');
    return labelStyle;
  });
};

/**
 * Convert ESRI style data to a readable style definition
 * @param {!esriPMS|esriSFS|esriSLS|esriSMS|esriTS} symbol - ESRI style definition
 * @param {!String} symbol.type - valid values are: `esriSMS`, `esriSLS`, `esriSFS`, `esriPMS` and `esriTS`
 * @return {import("./types").StyleType}
 * @see https://developers.arcgis.com/documentation/common-data-types/symbol-objects.htm
 */
const readSymbol = (symbol) => {
  switch (symbol.type) {
    case 'esriSMS':
      return {
        circle: {
          radius: symbol.size / 2,
          fill: symbol.color
            ? {
                color: `rgba(${symbol.color.join(',')})`,
              }
            : null,
          stroke: symbol.outline
            ? {
                color: `rgba(${symbol.outline.color.join(',')})`,
                width: symbol.outline.width,
              }
            : null,
        },
      };
    case 'esriSLS':
      return {
        stroke: {
          color: `rgba(${symbol.color.join(',')})`,
          width: symbol.width,
          lineDash: lineDashPattern[symbol.style],
        },
      };
    case 'esriSFS':
      let style = symbol.outline ? readSymbol(symbol.outline) : {};
      style.fill = { color: `rgba(${symbol.color.join(',')})` };
      return style;
    case 'esriPMS':
      return {
        icon: {
          src: `data:${symbol.contentType};base64,${symbol.imageData}`,
          rotation: symbol.angle,
          scale: symbol.width ? symbol.width/64 : 1,
          size: [64, 64],
        },
      };
    case 'esriTS':
      return {
        text: symbol.text,
        font: symbol.font ? `${symbol.font.style} ${symbol.font.weight} ${symbol.font.size}pt ${symbol.font.family}` : '20px Calibri,sans-serif',
        offsetX: symbol.xoffset + 20,
        offsetY: symbol.yoffset - 10,
        textAlign: symbol.horizontalAlignment,
        textBaseline: symbol.verticalAlignment,
        padding: [5, 5, 5, 5],
        angle: symbol.angle,
        fill: symbol.color ? { color: `rgba(${symbol.color.join(',')})` } : null,
        stroke: symbol.haloColor
          ? {
              color: `rgba(${symbol.haloColor.join(',')}`,
              width: symbol.haloSize ? symbol.haloSize : null,
            }
          : null,
        backgroundFill: symbol.backgroundColor
          ? {
              fill: { color: `rgba(${symbol.backgroundColor.join(',')})` },
            }
          : null,
        backgroundStroke: symbol.borderLineColor
          ? {
              stroke: {
                color: `rgba(${symbol.borderLineColor.join(',')})`,
                width: symbol.borderLineSize || null,
              },
            }
          : null,
      };
    default:
      throw `Symbol type "${symbol.type}" is not implemented yet`;
  }
};

/**
 * Filter styles based on field values
 *
 * @param {!Array<import('./types').EsriUniqueValueInfo>} styles - ESRI style definitions
 * @param {!String} delimiter - values delimiter
 * @return {Array<Object>}
 * @see https://developers.arcgis.com/documentation/common-data-types/renderer-objects.htm
 */
const filterUniqueValues = (styles, delimiter) => {
  let uniqueSymbols = new Map();
  styles.forEach((s) => {
    if (!uniqueSymbols.has(s.label)) {
      uniqueSymbols.set(s.label, s.symbol);
    }
  });

  let result = [];

  uniqueSymbols.forEach((symbol, label) => {
    const uniqueStyles = styles.filter((s) => {
      return s.label === label;
    });
    let field1Values = new Set();
    let field2Values = new Set();
    let field3Values = new Set();
    uniqueStyles.forEach((s) => {
      field1Values.add(s.value.split(delimiter)[0]);
      field2Values.add(s.value.split(delimiter)[1]);
      field3Values.add(s.value.split(delimiter)[2]);
    });

    result.push({
      title: label,
      symbol: symbol,
      field1Values: [...field1Values].join(),
      field2Values: [...field2Values].join(),
      field3Values: [...field3Values].join(),
    });
  });

  return result;
};

/**
 * @param {!Number} scale
 * @return {Number}
 */
var getMapResolutionFromScale = function(scale) {
  if (mapProjection) {
    var mpu = ol.proj.Units["METERS_PER_UNIT"][mapProjection.getUnits()];
  } else {
    var mpu = 1;
  }
  return scale / (mpu * 39.37 * (25.4 / 0.28));

};

//////////////////////////////////////////////////////////////
////                    styles.js                 ////////////
//////////////////////////////////////////////////////////////

// import { formatAttributes, formatObject } from '../helpers';
// import { defaultFeatureStyle, defaultLabelStyle } from './defaultStyle';

/**
 * Creates a new style.
 *
 * @param {import('./types').StyleType} [styleData]
 * @return {Style}
 */
var createFeatureStyle = function(styleData) {
  if (!styleData.icon) {
    styleData.icon = null;
  }
  if (!styleData.font) {
    styleData.font = null;
  }
  if (!styleData.fill) {
    styleData.fill = null;
  }
  if (!styleData.stroke) {
    styleData.stroke = null;
  }
  if (!styleData.circle) {
    styleData.circle = null;
  }

  const fill = styleData.fill ? new ol.style.Fill(styleData.fill) : null,
    stroke = styleData.stroke ? new ol.style.Stroke(styleData.stroke) : null,
    fontSymbol = styleData.font ? createLabelStyle(styleData.font) : null;
  let image = null;

  if (styleData.icon) {
    image = new ol.style.Icon(Object.assign({}, styleData.icon, { rotation: ol.math.toRadians(styleData.icon.rotation || 0) }));
  }
  if (styleData.circle) {
    const circleFill = styleData.circle.fill ? new ol.style.Fill(styleData.circle.fill) : null;
    const circleStroke = styleData.circle.stroke ? new ol.style.Stroke(styleData.circle.stroke) : null;
    image = new ol.style.Circle({ radius: styleData.circle.radius, fill: circleFill, stroke: circleStroke });
  }

  return new ol.style.Style({ stroke, fill, image, text: fontSymbol });
};

/**
 * Creates a text style. `text` property is not formatted, which means that it can contain $id, {ATTRIBUTE_NAME}...
 * Before the feature is drawn on the map you can call `getFormattedLabel` to create the actual text displayed on the map.
 *
 * @param {import('./types').LabelType} labelData
 * @return {Text}
 */
var createLabelStyle = function(labelData) {
  const rotation = ol.math.toRadians(labelData.rotation || 0);
  const fill = labelData.fill ? new ol.style.Fill(labelData.fill) : null;
  const stroke = labelData.stroke ? new ol.style.Stroke(labelData.stroke) : null;
  const backgroundFill = labelData.backgroundFill ? new ol.style.Fill(labelData.backgroundFill) : null;
  const backgroundStroke = labelData.backgroundStroke ? new ol.style.Stroke(labelData.backgroundStroke) : null;

  // text will be a template - can include: $id, {ATTRIBUTE_NAME}...
  // before the feature is drawn on the map it will be formatted based of feature attribute values
  return new ol.style.Text(Object.assign({}, labelData, { rotation, fill, stroke, backgroundFill, backgroundStroke }));
};




//////////////////////////////////////////////////////////////
////                formatters.js                 ////////////
//////////////////////////////////////////////////////////////


/**
 * Formats the label of a feature. The label can contain $id, {ATTRIBUTE_NAME}...
 * @param {!import('ol/Feature').default} feature
 * @param {!String} mask
 * @return {String}
 */
var getFormattedLabel = function(feature, mask) {
  if (mask.includes('$id')) mask = mask.replace('$id', feature.getId().toString());

  if (mask.includes('{')) {
    return formatObject(mask, feature.getProperties());
  } else {
    return mask;
  }
};

/**
 * Format a template string based on provided object with values (placeholders).
 * @param {!String} mask
 * @param {!Object.<String,*>} object - object, containing the field names and their values
 * @param {Boolean} [removeLeftovers=true] - remove unplaced fields from returned result
 * @example
 * // Following example will write to the console: 'Foo: bar ()', any non existing properties
 * // will be removed as we pass true as last parameter
 *
 * const template = '{name}: {value} ({nonExistingProperty})'
 * const obj = {name: 'Foo', value: 'bar'}
 *
 * formatObject(obj))
 * // 'Foo: bar ()'
 * formatObject(obj, false))
 * // 'Foo: bar ({nonExistingProperty})'
 * @return {String}
 */
var formatObject = function(mask, object, removeLeftovers = true) {
  let result = mask;
  for (let name in object) {
    const regEx = new RegExp('\\{' + name + '\\}', 'gm');
    result = result.replace(regEx, object[name]);
  }

  if (removeLeftovers) {
    const regex = new RegExp('{([a-zA-Z]*?)}');
    let match = null;
    //remove any '{someText}' strings left within the returned string
    while ((match = regex.exec(result)) !== null) {
      result = result.replace(regex, '');
    }
  }

  return result;
};
