# jsdocs

https://retreaver.com/documentation/javascript/v1/Retreaver.Number.html


# Usage

Include the retreaver.js script on the page.

```
<script src="/path/to/retreaver.js" type="text/javascript"></script>
```


# Examples

### Campaign

Initialize a campaign that will return numbers matching home_value:50000

```javascript
var campaign = new Retreaver.Campaign({ campaign_key: 'the_key_example' });
```

Request a number from the campaign matching tags, and use jQuery to display it on the page.

```javascript
var tags = { 
  home_value: '50000' 
};
campaign.request_number(tags, function (number) {
  $('#number_on_page').html( number.get('formatted_number') );
});
```


### Number

##### Tags

Display the tags currently attached to this number.

```javascript
number.get('tag_values');
```
 
Add / Remove / Clear Tags

```javascript
number.add_tags({'date_of_birth': '1980/01/01'});
number.remove_tags({'date_of_birth': '1980/01/01'});
number.clear_tags();
```

##### Release

When you are finished with a number you can release it back to the campaign.

```javascript
number.release();
```

##### Initiate Call

You can initiate a call with the user.

```javascript
number.initiate_call('1112224444', {}, function(call){
  // Call initiated
});
```

##### Attributes

Numbers have attributes that can be retrieved.

```javascript
number.get('campaign_key');
```

| Attribute         | Type            | Description                                                         |
| ----------------- |:---------------:|:-------------------------------------------------------------------:|
| id                | numeric         | number id                                                           |
| campaign_key      | alpha-numeric   | campaign key                                                        |
| formatted_number  | string          | formatted number according to national style `(866) 898-7878`       |
| number            | string          | E.164 formatted number `+18668987878`                               |
| plain_number      | string          | unformatted phone number digits `8668987878`                        |
| target_open       | boolean         | does this number have targets that are available to take calls?     |
| is_per_visitor    | boolean         | does this number track unique visitors?                             |
| tag_values        | object          | the tags currently assigned to this number                          |