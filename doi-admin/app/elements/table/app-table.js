var rest = require('../../../lib/rest');
var config = require('../../../lib/config');

Polymer({
    is: 'app-table',
    
    ready : function() {
      this.queryParams = {};  
    },
    
    attached : function() {
        this.query();
    },
    
    query : function() {
        rest.getDoiPackages(this.queryParams, this.onPackagesLoad.bind(this));
    },
    
    onPackagesLoad : function(packages) {
        this.packages = packages;
        this.render();
    },
    
    render : function() {
        var html = '<table class="table">';
        
        this.packages.forEach((pkg) => {
           var btnType = this.getBtnType(pkg);
            
           html += `
            <tr>
                <td><a target="_blank" href="${config.ckan.host}/dataset/${pkg.id}">${pkg.title}</a></td>
                <td>${pkg.status}</td>
                <td>
                    <div class="btn-group">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Update <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a>Approve</a></li>
                        <li><a>Request More Info</a></li>
                    </ul>
                    </div>
                </td>
            </tr>
           `;
        });
        
        this.innerHTML = `${html}</table>`;
    },
    
    getBtnType : function(pkg) {
        if( pkg.status === 'Pending Approval' ) {
            return 'foo';
        }
        return 'bar';
    }
});